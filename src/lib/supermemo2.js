export class SuperMemo2 {
  static calculate({ quality, interval = 0, repetitions = 0, easeFactor = 2.5 }) {
    if (quality < 0 || quality > 5) {
      throw new Error('Quality must be between 0 and 5')
    }

    let nextInterval
    let nextRepetitions
    let nextEaseFactor = easeFactor

    // Calcular o próximo fator de facilidade
    nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (nextEaseFactor < 1.3) nextEaseFactor = 1.3

    // Se a resposta foi correta
    if (quality >= 3) {
      switch (repetitions) {
        case 0:
          nextInterval = 1
          break
        case 1:
          nextInterval = 6
          break
        default:
          nextInterval = Math.round(interval * easeFactor)
      }
      nextRepetitions = repetitions + 1
    }
    // Se a resposta foi incorreta
    else {
      nextInterval = 1
      nextRepetitions = 0
    }

    return {
      interval: nextInterval,
      repetitions: nextRepetitions,
      easeFactor: nextEaseFactor
    }
  }
} 