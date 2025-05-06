const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { validateAuth, verifyResourceAccess } = require('../../middleware/auth');
const { validateRequiredFields, validateNumberRange } = require('../../middleware/validation');
const { sanitizeObject } = require('../../middleware/sanitization');

/**
 * Schema para validação de matéria
 */
const subjectSchema = {
  name: { type: 'string', required: false, maxLength: 100 },
  semester: { type: 'string', required: false, maxLength: 20 },
  minGrade: { type: 'number', required: false },
};

/**
 * Function para atualizar uma matéria existente
 */
exports.updateSubject = functions.https.onCall(async (data, context) => {
  try {
    // Verificar autenticação
    const userId = validateAuth(context);
    
    // Validar ID da matéria
    validateRequiredFields(data, ['id']);
    
    // Verificar acesso ao recurso
    await verifyResourceAccess(userId, 'gradesubjects', data.id);
    
    // Se minGrade estiver presente, validar valor
    if (data.minGrade !== undefined) {
      validateNumberRange(data.minGrade, 0, 10, 'Nota mínima');
    }
    
    // Sanitizar dados
    const sanitizedData = sanitizeObject(data, subjectSchema);
    delete sanitizedData.id; // Remover ID dos dados a atualizar
    
    // Adicionar timestamp de atualização
    const updateData = {
      ...sanitizedData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Atualizar no Firestore
    await admin.firestore().collection('gradesubjects').doc(data.id).update(updateData);
    
    // Registrar evento para auditoria
    await admin.firestore().collection('activity_logs').add({
      userId,
      action: 'update_subject',
      resourceId: data.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: { updatedFields: Object.keys(sanitizedData) }
    });
    
    // Retornar sucesso
    return {
      success: true,
      message: 'Matéria atualizada com sucesso'
    };
  } catch (error) {
    console.error('Erro ao atualizar matéria:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Ocorreu um erro ao atualizar a matéria. Tente novamente mais tarde.',
      error
    );
  }
}); 