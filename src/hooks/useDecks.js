import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc, onSnapshot, writeBatch, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

export function useDecks() {
  const { user } = useAuth()
  const [decks, setDecks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'decks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const decksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setDecks(decksData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const createDeck = async (data) => {
    try {
      await addDoc(collection(db, 'decks'), {
        ...data,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Erro ao criar deck:', error)
      throw error
    }
  }

  const updateDeck = async (id, data) => {
    try {
      const docRef = doc(db, 'decks', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Erro ao atualizar deck:', error)
      throw error
    }
  }

  const deleteDeck = async (id) => {
    try {
      // Primeiro, busca todos os flashcards do deck
      const flashcardsRef = collection(db, 'flashcards')
      const q = query(flashcardsRef, where('deckId', '==', id))
      const snapshot = await getDocs(q)
      
      // Deleta cada flashcard individualmente
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      // Depois deleta o deck
      await deleteDoc(doc(db, 'decks', id))

    } catch (error) {
      console.error('Erro ao deletar deck:', error)
      throw error
    }
  }

  return {
    decks,
    isLoading,
    createDeck,
    updateDeck,
    deleteDeck
  }
} 