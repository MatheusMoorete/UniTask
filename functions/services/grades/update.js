const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { validateAuth, verifyResourceAccess } = require('../../middleware/auth');
const { validateRequiredFields, validateNumberRange } = require('../../middleware/validation');
const { sanitizeObject } = require('../../middleware/sanitization');

/**
 * Schema para validação de nota
 */
const gradeSchema = {
  title: { type: 'string', required: false, maxLength: 100 },
  value: { type: 'number', required: false },
  weight: { type: 'number', required: false },
};

/**
 * Function para atualizar uma nota existente
 */
exports.updateGrade = functions.https.onCall(async (data, context) => {
  try {
    // Verificar autenticação
    const userId = validateAuth(context);
    
    // Validar campos obrigatórios
    validateRequiredFields(data, ['subjectId', 'gradeId']);
    
    // Verificar acesso à matéria
    await verifyResourceAccess(userId, 'gradesubjects', data.subjectId);
    
    // Validar valores se fornecidos
    if (data.value !== undefined) {
      validateNumberRange(data.value, 0, 10, 'Valor da nota');
    }
    
    if (data.weight !== undefined) {
      validateNumberRange(data.weight, 0.1, 10, 'Peso da nota');
    }
    
    // Sanitizar dados
    const sanitizedData = sanitizeObject(data, gradeSchema);
    
    // Referência ao documento da matéria para verificar existência
    const subjectRef = admin.firestore().collection('gradesubjects').doc(data.subjectId);
    
    // Verificar se a matéria existe
    const subjectDoc = await subjectRef.get();
    if (!subjectDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Matéria não encontrada');
    }
    
    // Referenciar o documento da nota diretamente
    const gradeRef = admin.firestore().collection('grades').doc(data.gradeId);
    
    // Verificar se a nota existe e pertence ao usuário
    const gradeDoc = await gradeRef.get();
    if (!gradeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Nota não encontrada');
    }
    
    const gradeData = gradeDoc.data();
    if (gradeData.userId !== userId || gradeData.subjectId !== data.subjectId) {
      throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão para atualizar esta nota');
    }
    
    // Preparar os dados para atualização
    const updateData = {
      ...sanitizedData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Atualizar a nota na coleção grades
    await gradeRef.update(updateData);
    
    // Atualizar o timestamp da matéria
    await subjectRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Registrar evento para auditoria
    await admin.firestore().collection('activity_logs').add({
      userId,
      action: 'update_grade',
      resourceId: data.subjectId,
      gradeId: data.gradeId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      details: { 
        subjectName: subjectDoc.data().name,
        updatedFields: Object.keys(sanitizedData)
      }
    });
    
    // Retornar sucesso
    return {
      success: true,
      message: 'Nota atualizada com sucesso'
    };
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Ocorreu um erro ao atualizar a nota. Tente novamente mais tarde.',
      error
    );
  }
}); 
}); 