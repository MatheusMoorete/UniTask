const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { validateAuth } = require('../../middleware/auth');
const { validateRequiredFields, validateNumberRange } = require('../../middleware/validation');
const { sanitizeObject } = require('../../middleware/sanitization');

/**
 * Schema para validação de matéria
 */
const subjectSchema = {
  name: { type: 'string', required: true, maxLength: 100 },
  semester: { type: 'string', required: true, maxLength: 20 },
  minGrade: { type: 'number', required: false, default: 6.0 },
  semesterId: { type: 'string', required: true }, // Campo obrigatório para identificar o semestre
};

/**
 * Function para criar uma nova matéria
 */
exports.createSubject = functions.https.onCall(async (data, context) => {
  try {
    // Verificar autenticação
    const userId = validateAuth(context);
    
    // Validar campos obrigatórios
    validateRequiredFields(data, ['name', 'semester', 'semesterId']);
    
    // Se minGrade estiver presente, validar valor
    if (data.minGrade !== undefined) {
      validateNumberRange(data.minGrade, 0, 10, 'Nota mínima');
    }
    
    // Verificar se o semestre existe e pertence ao usuário
    const semesterDoc = await admin.firestore().collection('semesters').doc(data.semesterId).get();
    if (!semesterDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'O semestre informado não existe.'
      );
    }
    
    const semesterData = semesterDoc.data();
    if (semesterData.userId !== userId) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Você não tem permissão para usar este semestre.'
      );
    }
    
    // Sanitizar dados
    const sanitizedData = sanitizeObject(data, subjectSchema);
    
    // Preparar objeto para salvar
    const newSubject = {
      ...sanitizedData,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Salvar no Firestore
    const docRef = await admin.firestore().collection('gradesubjects').add(newSubject);
    
    // Registrar evento para auditoria
    await admin.firestore().collection('activity_logs').add({
      userId,
      action: 'create_subject',
      resourceId: docRef.id,
      semesterId: data.semesterId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: { 
        subjectName: sanitizedData.name,
        semesterName: semesterData.name 
      }
    });
    
    // Retornar sucesso com ID
    return {
      success: true,
      id: docRef.id,
      message: 'Matéria criada com sucesso'
    };
  } catch (error) {
    console.error('Erro ao criar matéria:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Ocorreu um erro ao criar a matéria. Tente novamente mais tarde.',
      error
    );
  }
}); 