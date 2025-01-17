import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useSubjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Função auxiliar para calcular o máximo de faltas
  const calculateMaxAbsences = (totalHours, type1Hours, type2Hours, hasMultipleTypes, maxAbsencePercentage) => {
    // Calcula o número máximo de horas que pode faltar
    const maxHoursAbsence = (totalHours * maxAbsencePercentage) / 100
    
    // Se tem dois tipos de aula, usa o maior valor de horas por aula
    const hoursPerClass = hasMultipleTypes ? Math.max(type1Hours, type2Hours) : type1Hours
    
    // Converte para número de aulas e arredonda para baixo
    return Math.floor(maxHoursAbsence / hoursPerClass)
  }

  useEffect(() => {
    if (!user) {
      setSubjects([])
      setLoading(false)
      return
    }

    try {
      const q = query(
        collection(db, 'subjects'),
        where('userId', '==', user.uid)
      )

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const subjectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setSubjects(subjectsData)
        setLoading(false)
      }, (error) => {
        console.error('Erro ao carregar matérias:', error)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Erro na configuração da query:', error)
      setLoading(false)
    }
  }, [user])

  const addSubject = async (subjectData) => {
    try {
      const maxAbsences = calculateMaxAbsences(
        subjectData.totalHours,
        subjectData.type1.hours,
        subjectData.type2.hours,
        subjectData.hasMultipleTypes,
        subjectData.maxAbsencePercentage
      )
      
      await addDoc(collection(db, 'subjects'), {
        ...subjectData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        absences: 0,
        maxAbsences
      })
    } catch (error) {
      console.error('Erro ao adicionar matéria:', error)
      throw error
    }
  }

  const updateSubject = async (subjectId, updates) => {
    try {
      const subjectRef = doc(db, 'subjects', subjectId)
      const currentSubject = subjects.find(s => s.id === subjectId)
      
      // Recalcula o máximo de faltas se algum dos parâmetros necessários foi atualizado
      const shouldRecalculateMaxAbsences = 
        updates.totalHours !== undefined ||
        updates.type1?.hours !== undefined ||
        updates.type2?.hours !== undefined ||
        updates.hasMultipleTypes !== undefined ||
        updates.maxAbsencePercentage !== undefined

      const maxAbsences = shouldRecalculateMaxAbsences
        ? calculateMaxAbsences(
            updates.totalHours || currentSubject.totalHours,
            updates.type1?.hours || currentSubject.type1.hours,
            updates.type2?.hours || currentSubject.type2.hours,
            updates.hasMultipleTypes !== undefined ? updates.hasMultipleTypes : currentSubject.hasMultipleTypes,
            updates.maxAbsencePercentage || currentSubject.maxAbsencePercentage
          )
        : undefined

      await updateDoc(subjectRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        ...(maxAbsences !== undefined ? { maxAbsences } : {})
      })
    } catch (error) {
      console.error('Erro ao atualizar matéria:', error)
      throw error
    }
  }

  const deleteSubject = async (subjectId) => {
    try {
      const subjectRef = doc(db, 'subjects', subjectId)
      await deleteDoc(subjectRef)
    } catch (error) {
      console.error('Erro ao deletar matéria:', error)
      throw error
    }
  }

  const addAbsence = async (subjectId) => {
    try {
      const subject = subjects.find(s => s.id === subjectId)
      if (!subject) throw new Error('Matéria não encontrada')
      if ((subject.absences || 0) >= subject.maxAbsences) return

      const subjectRef = doc(db, 'subjects', subjectId)
      await updateDoc(subjectRef, {
        absences: (subject.absences || 0) + 1,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao adicionar falta:', error)
      throw error
    }
  }

  const removeAbsence = async (subjectId) => {
    try {
      const subject = subjects.find(s => s.id === subjectId)
      if (!subject) throw new Error('Matéria não encontrada')
      if (subject.absences <= 0) return

      const subjectRef = doc(db, 'subjects', subjectId)
      await updateDoc(subjectRef, {
        absences: subject.absences - 1,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao remover falta:', error)
      throw error
    }
  }

  return {
    subjects,
    loading,
    addSubject,
    updateSubject,
    deleteSubject,
    addAbsence,
    removeAbsence
  }
} 