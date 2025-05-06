import { https } from 'firebase-functions';
import { firestore } from 'firebase-admin';
import { validateAuth, verifyResourceAccess } from '../../middleware/auth.js';
import { validateRequiredFields } from '../../middleware/validation.js';

/**
 * Function para excluir uma matéria
 */
export const deleteSubject = https.onCall(async (data, context) => {
  try {
    // Verificar autenticação
    const userId = validateAuth(context);
    
    // Validar ID da matéria
    validateRequiredFields(data, ['id']);
    
    // Verificar acesso à matéria
    await verifyResourceAccess(userId, 'gradesubjects', data.id);
    
    // Obter a matéria para log antes de excluir
    const subjectDoc = await firestore().collection('gradesubjects').doc(data.id).get();
    
    if (!subjectDoc.exists) {
      throw new https.HttpsError(
        'not-found',
        'A matéria solicitada não existe.'
      );
    }
    
    const subjectData = subjectDoc.data();
    
    // Verificar permissões
    if (subjectData.userId !== userId) {
      throw new https.HttpsError(
        'permission-denied',
        'Você não tem permissão para excluir esta matéria.'
      );
    }
    
    // Excluir a matéria
    await firestore().collection('gradesubjects').doc(data.id).delete();
    
    // Excluir todas as notas relacionadas a esta matéria
    const gradesQuery = await firestore()
      .collection('grades')
      .where('subjectId', '==', data.id)
      .where('userId', '==', userId)
      .get();
      
    // Batch delete para eficiência
    const batch = firestore().batch();
    gradesQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (gradesQuery.docs.length > 0) {
      await batch.commit();
    }
    
    // Registrar evento para auditoria
    await firestore().collection('activity_logs').add({
      userId,
      action: 'delete_subject',
      resourceId: data.id,
      timestamp: firestore.FieldValue.serverTimestamp(),
      details: { 
        subjectName: subjectData.name,
        gradesCount: (subjectData.grades || []).length
      }
    });
    
    // Retornar sucesso
    return {
      success: true,
      message: 'Matéria excluída com sucesso'
    };
  } catch (error) {
    console.error('Erro ao excluir matéria:', error);
    
    if (error instanceof https.HttpsError) {
      throw error;
    }
    
    throw new https.HttpsError(
      'internal',
      'Ocorreu um erro ao excluir a matéria. Tente novamente mais tarde.',
      error
    );
  }
}); 