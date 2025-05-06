import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSemester } from '../contexts/SemesterContext'
import {
  collection,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'
import { useFirestore } from '../contexts/FirestoreContext'

export function useSubjects() {
  const { db } = useFirestore()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { activeSemesterId } = useSemester()

  // Função auxiliar para calcular o máximo de faltas
  const calculateMaxAbsences = (totalHours, type1Hours, type2Hours, type1HoursPerClass, type2HoursPerClass, hasMultipleTypes, maxAbsencePercentage) => {
    try {
      const maxAbsencePercentageNum = Number(maxAbsencePercentage) / 100 // Convertendo para decimal

      if (hasMultipleTypes) {
        // Calcula o número de aulas para cada tipo
        const type1Classes = Math.floor(type1Hours / type1HoursPerClass)
        const type2Classes = Math.floor(type2Hours / type2HoursPerClass)
        
        // Calcula o máximo de faltas em aulas para cada tipo
        const maxType1Absences = Math.floor(type1Classes * maxAbsencePercentageNum)
        const maxType2Absences = Math.floor(type2Classes * maxAbsencePercentageNum)
        
        return {
          type1: maxType1Absences,
          type2: maxType2Absences,
          totalHours: (maxType1Absences * type1HoursPerClass) + (maxType2Absences * type2HoursPerClass)
        }
      } else {
        // Para matérias com apenas um tipo de aula
        const totalClasses = Math.floor(totalHours / type1HoursPerClass)
        const maxAbsences = Math.floor(totalClasses * maxAbsencePercentageNum)
        
        return {
          type1: maxAbsences,
          totalHours: maxAbsences * type1HoursPerClass
        }
      }
    } catch (error) {
      console.error('Erro ao calcular máximo de faltas:', error)
      return { type1: 0, type2: 0, totalHours: 0 }
    }
  }

  useEffect(() => {
    if (!user || !activeSemesterId) {
      setSubjects([])
      setLoading(false)
      return
    }
    
    const subjectsQuery = query(
      collection(db, 'subjects'),
      where('userId', '==', user.uid),
      where('semesterId', '==', activeSemesterId),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(subjectsQuery, 
      (snapshot) => {
        const subjectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type1: doc.data().type1 || { absences: 0, hoursPerClass: 0, hours: 0 },
          type2: doc.data().type2 || { absences: 0, hoursPerClass: 0, hours: 0 },
          maxAbsences: doc.data().maxAbsences || { totalHours: 0, type1: 0, type2: 0 }
        }))
        setSubjects(subjectsData)
        setLoading(false)
      },
      (error) => {
        console.error('Erro ao carregar disciplinas:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, db, activeSemesterId])

  const addSubject = async (subjectData) => {
    try {
      if (!user) throw new Error('Usuário não autenticado')
      if (!activeSemesterId) throw new Error('Nenhum semestre selecionado')

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

      const subjectDoc = {
        name: subjectData.name,
        totalHours,
        hasMultipleTypes: subjectData.hasMultipleTypes,
        type1: {
          name: subjectData.type1.name,
          hours: type1Hours,
          hoursPerClass: type1HoursPerClass,
          absences: 0
        },
        type2: subjectData.hasMultipleTypes ? {
          name: subjectData.type2.name,
          hours: type2Hours,
          hoursPerClass: type2HoursPerClass,
          absences: 0
        } : null,
        maxAbsencePercentage,
        maxAbsences,
        userId: user.uid,
        semesterId: activeSemesterId,
        createdAt: serverTimestamp()
      }

      await addDoc(collection(db, 'subjects'), subjectDoc)
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