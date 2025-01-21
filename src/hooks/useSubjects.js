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
import { useFirestore } from '../contexts/FirestoreContext'

export function useSubjects() {
  const { db } = useFirestore()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Função auxiliar para calcular o máximo de faltas
  const calculateMaxAbsences = (totalHours, type1Hours, type2Hours, type1HoursPerClass, type2HoursPerClass, hasMultipleTypes, maxAbsencePercentage) => {
    try {
      const maxAbsencePercentageNum = Number(maxAbsencePercentage)
      
      if (hasMultipleTypes) {
        // Calcula separadamente para cada tipo
        const type1TotalHours = Number(type1Hours)
        const type2TotalHours = Number(type2Hours)
        const type1HoursPerClassNum = Number(type1HoursPerClass)
        const type2HoursPerClassNum = Number(type2HoursPerClass)
        
        // Calcula o máximo de faltas para cada tipo
        const maxType1Hours = (type1TotalHours * maxAbsencePercentageNum) / 100
        const maxType2Hours = (type2TotalHours * maxAbsencePercentageNum) / 100
        
        // Retorna objeto com máximo de faltas para cada tipo
        return {
          type1: Math.floor(maxType1Hours / type1HoursPerClassNum), // Número de aulas teóricas que pode faltar
          type2: Math.floor(maxType2Hours / type2HoursPerClassNum), // Número de aulas práticas que pode faltar
          totalHours: (maxType1Hours + maxType2Hours) // Total de horas que pode faltar
        }
      } else {
        // Para matérias com apenas um tipo de aula
        const totalHoursNum = Number(totalHours)
        const hoursPerClassNum = Number(type1HoursPerClass)
        const maxHoursAbsence = (totalHoursNum * maxAbsencePercentageNum) / 100
        
        return {
          type1: Math.floor(maxHoursAbsence / hoursPerClassNum),
          totalHours: maxHoursAbsence
        }
      }
    } catch (error) {
      console.error('Erro ao calcular máximo de faltas:', error)
      return { type1: 0, type2: 0, totalHours: 0 }
    }
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
      const totalHours = Number(subjectData.totalHours)
      const type1Hours = Number(subjectData.type1.hours)
      const type2Hours = subjectData.hasMultipleTypes ? Number(subjectData.type2.hours) : 0
      const type1HoursPerClass = Number(subjectData.type1.hoursPerClass)
      const type2HoursPerClass = subjectData.hasMultipleTypes ? Number(subjectData.type2.hoursPerClass) : 0
      const maxAbsencePercentage = Number(subjectData.maxAbsencePercentage)

      const maxAbsences = calculateMaxAbsences(
        totalHours,
        type1Hours,
        type2Hours,
        type1HoursPerClass,
        type2HoursPerClass,
        subjectData.hasMultipleTypes,
        maxAbsencePercentage
      )
      
      await addDoc(collection(db, 'subjects'), {
        ...subjectData,
        totalHours,
        type1: {
          ...subjectData.type1,
          hours: type1Hours,
          hoursPerClass: type1HoursPerClass,
          absences: 0,
        },
        type2: {
          ...subjectData.type2,
          hours: type2Hours,
          hoursPerClass: type2HoursPerClass,
          absences: 0,
        },
        maxAbsencePercentage,
        userId: user.uid,
        createdAt: serverTimestamp(),
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
            updates.type1?.hoursPerClass || currentSubject.type1.hoursPerClass,
            updates.type2?.hoursPerClass || currentSubject.type2.hoursPerClass,
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

  const addAbsence = async (subjectId, type) => {
    try {
      const subject = subjects.find(s => s.id === subjectId)
      if (!subject) throw new Error('Matéria não encontrada')

      const subjectRef = doc(db, 'subjects', subjectId)
      
      if (subject.hasMultipleTypes) {
        // Verifica se ainda pode faltar neste tipo de aula
        const currentAbsences = subject[type].absences || 0
        const maxAbsencesForType = subject.maxAbsences[type]
        
        if (currentAbsences >= maxAbsencesForType) return

        await updateDoc(subjectRef, {
          [`${type}.absences`]: currentAbsences + 1,
          updatedAt: serverTimestamp()
        })
      } else {
        // Para matérias com apenas um tipo
        const currentAbsences = subject.type1.absences || 0
        if (currentAbsences >= subject.maxAbsences.type1) return

        await updateDoc(subjectRef, {
          'type1.absences': currentAbsences + 1,
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Erro ao adicionar falta:', error)
      throw error
    }
  }

  const removeAbsence = async (subjectId, type) => {
    try {
      const subject = subjects.find(s => s.id === subjectId)
      if (!subject) throw new Error('Matéria não encontrada')

      const subjectRef = doc(db, 'subjects', subjectId)
      
      if (subject.hasMultipleTypes) {
        const currentAbsences = subject[type].absences || 0
        if (currentAbsences <= 0) return

        await updateDoc(subjectRef, {
          [`${type}.absences`]: currentAbsences - 1,
          updatedAt: serverTimestamp()
        })
      } else {
        const currentAbsences = subject.type1.absences || 0
        if (currentAbsences <= 0) return

        await updateDoc(subjectRef, {
          'type1.absences': currentAbsences - 1,
          updatedAt: serverTimestamp()
        })
      }
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