import { https } from 'firebase-functions';
import { firestore } from 'firebase-admin';

/**
 * Middleware para verificar autenticação
 * @param {Object} context - Contexto da Cloud Function
 * @returns {string} - UID do usuário autenticado
 * @throws {HttpsError} - Erro se autenticação falhar
 */
export const validateAuth = (context) => {
  if (!context.auth) {
    throw new https.HttpsError(
      'unauthenticated', 
      'Você precisa estar autenticado para realizar esta operação.'
    );
  }
  return context.auth.uid;
};

/**
 * Verifica se o usuário tem permissão para o recurso
 * @param {string} userId - ID do usuário a verificar
 * @param {string} resourcePath - Caminho do recurso no Firestore
 * @param {string} resourceId - ID do documento
 * @param {string} semesterId - ID do semestre para verificação adicional (opcional)
 * @returns {Promise<boolean>} - True se tem permissão
 * @throws {HttpsError} - Erro se verificação falhar
 */
export const verifyResourceAccess = async (userId, resourcePath, resourceId, semesterId = null) => {
  try {
    const doc = await firestore().collection(resourcePath).doc(resourceId).get();
    
    if (!doc.exists) {
      throw new https.HttpsError(
        'not-found', 
        'O recurso solicitado não existe.'
      );
    }
    
    const data = doc.data();
    if (data.userId !== userId) {
      throw new https.HttpsError(
        'permission-denied', 
        'Você não tem permissão para acessar este recurso.'
      );
    }
    
    // Verificação adicional de semestre, se fornecido
    if (semesterId && data.semesterId && data.semesterId !== semesterId) {
      throw new https.HttpsError(
        'failed-precondition',
        'Este recurso pertence a outro semestre.'
      );
    }
    
    return true;
  } catch (error) {
    if (error instanceof https.HttpsError) {
      throw error;
    }
    throw new https.HttpsError('internal', 'Erro ao verificar permissões', error);
  }
};

/**
 * Verifica se o semestre existe e pertence ao usuário
 * @param {string} userId - ID do usuário a verificar
 * @param {string} semesterId - ID do semestre
 * @returns {Promise<Object>} - Dados do semestre
 * @throws {HttpsError} - Erro se verificação falhar
 */
export const verifySemesterAccess = async (userId, semesterId) => {
  try {
    if (!semesterId) {
      throw new https.HttpsError(
        'invalid-argument',
        'ID do semestre não fornecido.'
      );
    }
    
    const semesterDoc = await firestore().collection('semesters').doc(semesterId).get();
    
    if (!semesterDoc.exists) {
      throw new https.HttpsError(
        'not-found',
        'O semestre informado não existe.'
      );
    }
    
    const semesterData = semesterDoc.data();
    if (semesterData.userId !== userId) {
      throw new https.HttpsError(
        'permission-denied',
        'Você não tem permissão para acessar este semestre.'
      );
    }
    
    return semesterData;
  } catch (error) {
    if (error instanceof https.HttpsError) {
      throw error;
    }
    throw new https.HttpsError('internal', 'Erro ao verificar permissões do semestre', error);
  }
}; 