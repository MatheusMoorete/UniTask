export function capitalizeMonth(date, locale = 'pt-BR') {
  return date.toLocaleString(locale, { month: 'long' })
    .replace(/^\w/, (c) => c.toUpperCase())
} 