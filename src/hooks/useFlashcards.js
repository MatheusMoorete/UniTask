//Hook para gerenciamento de flashcards

import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, onSnapshot, writeBatch } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'
import supermemo2 from 'supermemo2'

export function useFlashcards(deckId) {
  const { user } = useAuth()
  const [flashcards, setFlashcards] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user || !deckId) return

    const q = query(
      collection(db, 'flashcards'),
      where('deckId', '==', deckId),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const flashcardsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setFlashcards(flashcardsData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user, deckId])

  const createFlashcard = async (data) => {
    try {
      if (!data.deckId) {
        throw new Error('deckId é obrigatório')
      }

      // Inicializa com intervalo de 1 dia
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const docRef = await addDoc(collection(db, 'flashcards'), {
        ...data,
        userId: user.uid,
        deckId: data.deckId,
        createdAt: new Date(),
        updatedAt: new Date(),
        repetitionData: {
          interval: 1,
          repetitions: 0,
          easeFactor: 2.5,
          nextReview: tomorrow,
          ...data.repetitionData
        }
      })
      return docRef.id
    } catch (error) {
      console.error('Erro ao criar flashcard:', error)
      throw error
    }
  }

  const updateFlashcard = async (id, data) => {
    try {
      const docRef = doc(db, 'flashcards', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Erro ao atualizar flashcard:', error)
      throw error
    }
  }

  const processAnswer = async (card, quality) => {
    // Se for erro (quality = 0) ou resposta difícil (quality = 1), 
    // volta para modo de aprendizagem
    if (quality <= 1) {
      console.log('Voltando para modo de aprendizagem')
      const nextReview = new Date()
      nextReview.setMinutes(nextReview.getMinutes() + 10) // Revisa em 10 minutos
      
      const docRef = doc(db, 'flashcards', card.id)
      await updateDoc(docRef, {
        'repetitionData.interval': 0,
        'repetitionData.repetitions': 0,
        'repetitionData.easeFactor': 2.5, // Reset do fator de dificuldade
        'repetitionData.lastReview': new Date(),
        'repetitionData.nextReview': nextReview,
        updatedAt: new Date()
      })
      return
    }

    // Ajusta a qualidade para o formato do SM-2 (3-5)
    // quality 2 (Bom) -> 3
    // quality 3 (Fácil) -> 4
    // quality 4 (Muito Fácil) -> 5
    const sm2Quality = quality + 1

    // Garante que os valores iniciais são números
    const lastInterval = Number(card.repetitionData.interval) || 0
    const lastRepetition = Number(card.repetitionData.repetitions) || 0
    const lastEFactor = Number(card.repetitionData.easeFactor) || 2.5

    console.log('Valores de entrada:', {
      quality: sm2Quality,
      lastInterval,
      lastRepetition,
      lastEFactor
    })

    // Usa a biblioteca supermemo2 para calcular o próximo intervalo
    const result = supermemo2({
      quality: sm2Quality,
      lastInterval,
      lastRepetition,
      lastEFactor
    })

    console.log('Resultado do supermemo2:', result)

    // Calcula o próximo intervalo baseado no resultado
    let nextInterval = result.schedule
    if (lastRepetition === 0) {
      // Primeira repetição bem sucedida
      nextInterval = 1
    } else if (lastRepetition === 1) {
      // Segunda repetição bem sucedida
      nextInterval = 6
    }

    // Calcula a próxima data de revisão
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + nextInterval)
    nextReview.setHours(0, 0, 0, 0)

    console.log('Valores a serem salvos:', {
      interval: nextInterval,
      repetitions: lastRepetition + 1,
      easeFactor: result.factor,
      nextReview
    })

    const docRef = doc(db, 'flashcards', card.id)
    await updateDoc(docRef, {
      'repetitionData.interval': nextInterval,
      'repetitionData.repetitions': lastRepetition + 1,
      'repetitionData.easeFactor': result.factor,
      'repetitionData.lastReview': new Date(),
      'repetitionData.nextReview': nextReview,
      updatedAt: new Date()
    })
  }

  const deleteFlashcard = async (cardIds) => {
    try {
      // Se for um array de IDs, exclui em massa
      if (Array.isArray(cardIds)) {
        const batch = writeBatch(db)
        cardIds.forEach(id => {
          const docRef = doc(db, 'flashcards', id)
          batch.delete(docRef)
        })
        await batch.commit()
        return
      }
      
      // Exclusão de card único
      const docRef = doc(db, 'flashcards', cardIds)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erro ao excluir flashcard:', error)
      throw error
    }
  }

  const isDueForReview = (card) => {
    // Verifica se o card tem a estrutura necessária
    if (!card.repetitionData || !card.repetitionData.nextReview) {
      // Se não tiver data de próxima revisão, considera como novo
      return true
    }

    try {
      const nextReview = new Date(card.repetitionData.nextReview?.toDate?.() || card.repetitionData.nextReview)
      const today = new Date()
      
      // Verifica se a data é válida
      if (isNaN(nextReview.getTime())) {
        console.warn('Data inválida para o card:', card.id)
        return true
      }

      today.setHours(0, 0, 0, 0)
      nextReview.setHours(0, 0, 0, 0)
      
      return nextReview <= today
    } catch (error) {
      console.error('Erro ao processar data do card:', card.id, error)
      // Em caso de erro, considera o card como devido para revisão
      return true
    }
  }

  const getDueCards = () => {
    return flashcards.filter(card => {
      try {
        // Se não tem dados de repetição, é um card novo
        if (!card.repetitionData) {
          return true
        }

        const nextReview = card.repetitionData.nextReview
        
        // Se não tem próxima revisão definida, é um card novo
        if (!nextReview) {
          return true
        }

        // Converte a data do Firestore
        const nextReviewDate = new Date(nextReview?.toDate?.() || nextReview)
        const today = new Date()
        
        // Se a data é inválida, não inclui o card
        if (isNaN(nextReviewDate.getTime())) {
          console.warn('Data inválida para o card:', card.id)
          return false
        }

        // Normaliza as datas para comparação (remove horas/minutos/segundos)
        today.setHours(0, 0, 0, 0)
        nextReviewDate.setHours(0, 0, 0, 0)
        
        // Card está disponível se:
        // 1. Nunca foi estudado (repetitions = 0)
        // 2. A data de revisão é hoje ou anterior
        return card.repetitionData.repetitions === 0 || nextReviewDate <= today
      } catch (error) {
        console.error('Erro ao processar data do card:', card.id, error)
        return false
      }
    })
  }

  const finishSession = async () => {
    // Opcional: Aqui você pode adicionar lógica adicional ao finalizar a sessão
    // Por exemplo, atualizar estatísticas do usuário, etc.
    console.log('Sessão de estudo finalizada')
  }

  // Função para migrar cards antigos
  const migrateOldCards = async (cards) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    for (const card of cards) {
      if (!card.repetitionData) {
        try {
          const docRef = doc(db, 'flashcards', card.id)
          await updateDoc(docRef, {
            repetitionData: {
              interval: 1,
              repetitions: 0,
              easeFactor: 2.5,
              nextReview: tomorrow,
              lastReview: null
            },
            updatedAt: new Date()
          })
          console.log('Card migrado com sucesso:', card.id)
        } catch (error) {
          console.error('Erro ao migrar card:', card.id, error)
        }
      }
    }
  }

  // Efeito para verificar e migrar cards antigos
  useEffect(() => {
    if (flashcards.length > 0) {
      const oldCards = flashcards.filter(card => !card.repetitionData)
      if (oldCards.length > 0) {
        console.log('Iniciando migração de', oldCards.length, 'cards antigos')
        migrateOldCards(oldCards)
      }
    }
  }, [flashcards])

  return {
    flashcards,
    isLoading,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    processAnswer,
    isDueForReview,
    getDueCards,
    finishSession
  }
}
