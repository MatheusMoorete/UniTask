const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { validateAuth, verifyResourceAccess } = require('../../middleware/auth');
const { validateRequiredFields, validateNumberRange } = require('../../middleware/validation');
const { sanitizeObject } = require('../../middleware/sanitization');

/**
 * Schema para validação de nota
 */
const gradeSchema = {
  title: { type: 'string', required: true, maxLength: 100 },
  value: { type: 'number', required: true },
  weight: { type: 'number', required: false, default: 1 },
  semesterId: { type: 'string', required: true }, // Campo obrigatório para identificar o semestre
};

/**
 * Function para adicionar uma nota a uma matéria
 */
exports.addGrade = functions.https.onCall(async (data, context) => {
  try {
    // Verificar autenticação
    const userId = validateAuth(context);
    
    // Validar campos obrigatórios
    validateRequiredFields(data, ['subjectId', 'title', 'value', 'semesterId']);
    
    // Verificar acesso à matéria
    await verifyResourceAccess(userId, 'gradesubjects', data.subjectId);
    
    // Validar valor da nota
    validateNumberRange(data.value, 0, 10, 'Valor da nota');
    
    // Validar peso se fornecido
    if (data.weight !== undefined) {
      validateNumberRange(data.weight, 0.1, 10, 'Peso da nota');
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
    
    // Verificar se a matéria pertence ao mesmo semestre
    const subjectDoc = await admin.firestore().collection('gradesubjects').doc(data.subjectId).get();
    if (!subjectDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Matéria não encontrada');
    }
    
    const subjectData = subjectDoc.data();
    if (subjectData.semesterId !== data.semesterId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'A nota deve pertencer ao mesmo semestre da matéria.'
      );
    }
    
    // Sanitizar dados
    const sanitizedData = sanitizeObject(data, gradeSchema);
    
    // Referência ao documento da matéria
    const subjectRef = admin.firestore().collection('gradesubjects').doc(data.subjectId);
    
    // Criar documento de nota em sua própria coleção
    const newGrade = {
      ...sanitizedData,
      userId,
      subjectId: data.subjectId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Adicionar à coleção grades
    const gradeRef = await admin.firestore().collection('grades').add(newGrade);
    
    // Atualizar o timestamp da matéria
    await subjectRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Registrar evento para auditoria
    await admin.firestore().collection('activity_logs').add({
      userId,
      action: 'add_grade',
      resourceId: data.subjectId,
      gradeId: gradeRef.id,
      semesterId: data.semesterId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: { 
        subjectName: subjectData.name,
        gradeTitle: sanitizedData.title,
        gradeValue: sanitizedData.value
      }
    });
    
    // Retornar sucesso
    return {
      success: true,
      gradeId: gradeRef.id,
      message: 'Nota adicionada com sucesso'
    };
  } catch (error) {
    console.error('Erro ao adicionar nota:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Ocorreu um erro ao adicionar a nota. Tente novamente mais tarde.',
      error
    );
  }
}); 