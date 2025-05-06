import { https } from 'firebase-functions';
import { firestore } from 'firebase-admin';
import { validateAuth, verifyResourceAccess } from '../../middleware/auth.js';
import { validateRequiredFields } from '../../middleware/validation.js';

/**
 * Function para excluir uma nota
 */
export const deleteGrade = https.onCall(async (data, context) => {
  try {
    // Verificar autenticação
    const userId = validateAuth(context);
    
    // Validar campos obrigatórios
    validateRequiredFields(data, ['subjectId', 'gradeId']);
    
    // Verificar acesso à matéria
    await verifyResourceAccess(userId, 'gradesubjects', data.subjectId);
    
    // Referência ao documento da matéria para verificação
    const subjectRef = firestore().collection('gradesubjects').doc(data.subjectId);
    
    // Verificar se a matéria existe
    const subjectDoc = await subjectRef.get();
    if (!subjectDoc.exists) {
      throw new https.HttpsError('not-found', 'Matéria não encontrada');
    }
    
    // Referência ao documento da nota
    const gradeRef = firestore().collection('grades').doc(data.gradeId);
    
    // Verificar se a nota existe e pertence ao usuário
    const gradeDoc = await gradeRef.get();
    if (!gradeDoc.exists) {
      throw new https.HttpsError('not-found', 'Nota não encontrada');
    }
    
    const gradeData = gradeDoc.data();
    if (gradeData.userId !== userId || gradeData.subjectId !== data.subjectId) {
      throw new https.HttpsError('permission-denied', 'Você não tem permissão para excluir esta nota');
    }
    
    // Guardar informações da nota para o log
    const deletedGrade = gradeDoc.data();
    
    // Excluir a nota da coleção grades
    await gradeRef.delete();
    
    // Atualizar o timestamp da matéria
    await subjectRef.update({
      updatedAt: firestore.FieldValue.serverTimestamp()
    });
    
    // Registrar evento para auditoria
    await firestore().collection('activity_logs').add({
      userId,
      action: 'delete_grade',
      resourceId: data.subjectId,
      gradeId: data.gradeId,
      timestamp: firestore.FieldValue.serverTimestamp(),
      details: { 
        subjectName: subjectDoc.data().name,
        gradeTitle: deletedGrade.title,
        gradeValue: deletedGrade.value
      }
    });
    
    // Retornar sucesso
    return {
      success: true,
      message: 'Nota excluída com sucesso'
    };
  } catch (error) {
    console.error('Erro ao excluir nota:', error);
    
    if (error instanceof https.HttpsError) {
      throw error;
    }
    
    throw new https.HttpsError(
      'internal',
      'Ocorreu um erro ao excluir a nota. Tente novamente mais tarde.',
      error
    );
  }
}); 