import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
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

  const deleteFlashcard = async (id) => {
    try {
      await deleteDoc(doc(db, 'flashcards', id))
    } catch (error) {
      console.error('Erro ao deletar flashcard:', error)
      throw error
    }
  }

  return {
    flashcards,
    isLoading,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    processAnswer
  }
}
