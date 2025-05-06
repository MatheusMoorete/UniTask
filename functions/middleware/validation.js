const functions = require('firebase-functions');

/**
 * Valida campos obrigatórios
 * @param {Object} data - Dados a serem validados
 * @param {Array<string>} requiredFields - Lista de campos obrigatórios
 * @throws {HttpsError} - Erro se algum campo obrigatório estiver ausente
 */
exports.validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Campos obrigatórios ausentes: ${missingFields.join(', ')}`
    );
  }
};

/**
 * Valida que um valor está dentro de um intervalo numérico
 * @param {string|number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {string} fieldName - Nome do campo para mensagem de erro
 * @throws {HttpsError} - Erro se o valor estiver fora do intervalo
 */
exports.validateNumberRange = (value, min, max, fieldName) => {
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `${fieldName} deve ser um número válido.`
    );
  }
  
  if (numValue < min || numValue > max) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `${fieldName} deve estar entre ${min} e ${max}.`
    );
  }
  
  return numValue;
};

/**
 * Valida o tamanho de uma string
 * @param {string} value - String a validar
 * @param {number} maxLength - Tamanho máximo permitido
 * @param {string} fieldName - Nome do campo para mensagem de erro
 * @throws {HttpsError} - Erro se a string for muito longa
 */
exports.validateStringLength = (value, maxLength, fieldName) => {
  if (value && value.length > maxLength) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `${fieldName} deve ter no máximo ${maxLength} caracteres.`
    );
  }
}; 