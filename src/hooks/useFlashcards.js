import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'
import { SuperMemo2 } from '../lib/supermemo2'

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

      const docRef = await addDoc(collection(db, 'flashcards'), {
        ...data,
        userId: user.uid,
        deckId: data.deckId,
        createdAt: new Date(),
        updatedAt: new Date(),
        repetitionData: {
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          nextReview: new Date(),
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
    const { interval, repetitions, easeFactor } = calculateNextReview(
      card.repetitionData,
      quality
    )

    const docRef = doc(db, 'flashcards', card.id)
    await updateDoc(docRef, {
      'repetitionData.interval': interval,
      'repetitionData.repetitions': repetitions,
      'repetitionData.easeFactor': easeFactor,
      'repetitionData.lastReview': new Date(),
      'repetitionData.nextReview': new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
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

// Algoritmo SM-2 para cálculo do próximo intervalo
function calculateNextReview(data, quality) {
  let { interval, repetitions, easeFactor } = data

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    repetitions += 1
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
  }

  // Ajusta o fator de facilidade
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  return { interval, repetitions, easeFactor }
} 