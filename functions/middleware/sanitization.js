const validator = require('validator');
const sanitizeHtml = require('sanitize-html');

/**
 * Sanitiza uma string removendo tags HTML e controlando o tamanho
 * @param {string} value - String a sanitizar
 * @param {number} maxLength - Tamanho máximo permitido
 * @returns {string} - String sanitizada
 */
exports.sanitizeString = (value, maxLength = 500) => {
  if (!value) return '';
  
  // Converte para string
  const stringValue = String(value);
  
  // Remove tags HTML, mantendo apenas texto simples
  const sanitized = sanitizeHtml(stringValue, {
    allowedTags: [],
    allowedAttributes: {}
  });
  
  // Limita o tamanho
  return validator.trim(sanitized).substring(0, maxLength);
};

/**
 * Sanitiza números
 * @param {string|number} value - Valor a sanitizar
 * @param {number} defaultValue - Valor padrão se inválido
 * @returns {number} - Número sanitizado
 */
exports.sanitizeNumber = (value, defaultValue = 0) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Sanitiza um objeto inteiro
 * @param {Object} data - Objeto a sanitizar
 * @param {Object} schema - Esquema com tipos e validações
 * @returns {Object} - Objeto sanitizado
 */
exports.sanitizeObject = (data, schema) => {
  const sanitized = {};
  
  Object.keys(schema).forEach(key => {
    if (data[key] !== undefined) {
      const field = schema[key];
      
      switch (field.type) {
        case 'string':
          sanitized[key] = exports.sanitizeString(data[key], field.maxLength);
          break;
        case 'number':
          sanitized[key] = exports.sanitizeNumber(data[key], field.default);
          break;
        case 'boolean':
          sanitized[key] = Boolean(data[key]);
          break;
        default:
          sanitized[key] = data[key];
      }
    } else if (field.required) {
      sanitized[key] = field.default;
    }
  });
  
  return sanitized;
}; 