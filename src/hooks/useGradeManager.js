import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
import { useSemester } from '../contexts/SemesterContext'
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore'
import { showToast } from '../lib/toast'
import { apiService } from '../services/api'

export function useGradeManager() {
  const { user } = useAuth()
  const { db } = useFirestore()
  const { currentSemester, activeSemesterId, withCurrentSemester } = useSemester()
  const [loading, setLoading] = useState(true)
  
  // Estado para matérias e suas notas
  const [subjects, setSubjects] = useState([])
  
  // Buscar matérias e notas do Firebase
  useEffect(() => {
    if (!user?.uid || !activeSemesterId) {
      setSubjects([])
      setLoading(false)
      return
    }

    const subjectsQuery = query(
      collection(db, 'gradesubjects'),
      where('userId', '==', user.uid),
      where('semesterId', '==', activeSemesterId)
    )

    const unsubscribe = onSnapshot(subjectsQuery, async (snapshot) => {
      try {
        // Mapear matérias
        const subjectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        // Para cada matéria, buscar suas notas
        const subjectsWithGrades = await Promise.all(
          subjectsData.map(async (subject) => {
            const gradesQuery = query(
              collection(db, 'grades'),
              where('userId', '==', user.uid),
              where('subjectId', '==', subject.id),
              where('semesterId', '==', activeSemesterId)
            )
            
            const gradesSnapshot = await getDocs(gradesQuery)
            const grades = gradesSnapshot.docs.map(gradeDoc => ({
              id: gradeDoc.id,
              ...gradeDoc.data()
            }))
            
            return {
              ...subject,
              grades: grades || []
            }
          })
        )
        
        setSubjects(subjectsWithGrades)
        setLoading(false)
      } catch (error) {
        console.error("Erro ao carregar matérias:", error)
        showToast.error("Ocorreu um erro ao carregar suas matérias")
        setLoading(false)
      }
    }, (error) => {
      console.error("Erro ao escutar matérias:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, db, activeSemesterId])
  
  // Efeito para escutar mudanças nas notas
  useEffect(() => {
    if (!user?.uid || !subjects.length || !activeSemesterId) return

    const unsubscribeGrades = subjects.map(subject => {
      const gradesQuery = query(
        collection(db, 'grades'),
        where('userId', '==', user.uid),
        where('subjectId', '==', subject.id),
        where('semesterId', '==', activeSemesterId)
      )

      return onSnapshot(gradesQuery, (snapshot) => {
        const grades = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setSubjects(prevSubjects => 
          prevSubjects.map(s => 
            s.id === subject.id 
              ? { ...s, grades } 
              : s
          )
        )
      })
    })

    return () => unsubscribeGrades.forEach(unsubscribe => unsubscribe())
  }, [user, db, subjects, activeSemesterId])
  
  // Funções para gerenciar matérias usando Cloud Functions
  const addSubject = async (subjectData) => {
    try {
      // Adiciona o ID do semestre atual aos dados da matéria
      const subjectWithSemester = withCurrentSemester(subjectData);
      
      const result = await apiService.createSubject(subjectWithSemester);
      
      if (result.success) {
        showToast.success('Matéria adicionada com sucesso!');
        return result.id;
      } else {
        showToast.error(result.error || 'Erro ao adicionar matéria');
        return null;
      }
    } catch (error) {
      console.error('Erro ao adicionar matéria:', error);
      showToast.error('Ocorreu um erro ao adicionar a matéria');
      return null;
    }
  }

  const updateSubject = async (subjectId, subjectData) => {
    try {
      // Adiciona o ID do semestre atual aos dados da matéria
      const subjectWithSemester = withCurrentSemester(subjectData);
      
      const result = await apiService.updateSubject(subjectId, subjectWithSemester);
      
      if (result.success) {
        showToast.success('Matéria atualizada com sucesso!');
        return true;
      } else {
        showToast.error(result.error || 'Erro ao atualizar matéria');
        return false;
      }
    } catch (error) {
      console.error('Erro ao atualizar matéria:', error);
      showToast.error('Ocorreu um erro ao atualizar a matéria');
      return false;
    }
  }

  const deleteSubject = async (subjectId) => {
    try {
      const result = await apiService.deleteSubject(subjectId);
      
      if (result.success) {
        showToast.success('Matéria e suas notas foram excluídas com sucesso!');
        return true;
      } else {
        showToast.error(result.error || 'Erro ao excluir matéria');
        return false;
      }
    } catch (error) {
      console.error('Erro ao excluir matéria:', error);
      showToast.error('Ocorreu um erro ao excluir a matéria');
      return false;
    }
  }

  // Funções para gerenciar notas usando Cloud Functions
  const addGrade = async (subjectId, gradeData) => {
    try {
      // Adiciona o ID do semestre atual aos dados da nota
      const gradeWithSemester = withCurrentSemester({
        ...gradeData,
        createdAt: new Date().toISOString()
      });
      
      const result = await apiService.addGrade(subjectId, gradeWithSemester);
      
      if (result.success) {
        showToast.success('Nota adicionada com sucesso!');
        return true;
      } else {
        showToast.error(result.error || 'Erro ao adicionar nota');
        return false;
      }
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      showToast.error('Ocorreu um erro ao adicionar a nota');
      return false;
    }
  }

  const updateGrade = async (gradeId, gradeData) => {
    try {
      // Adiciona o ID do semestre atual aos dados da nota
      const gradeWithSemester = withCurrentSemester({
        ...gradeData,
        updatedAt: new Date().toISOString()
      });
      
      const result = await apiService.updateGrade(gradeWithSemester.subjectId, gradeId, gradeWithSemester);
      
      if (result.success) {
        showToast.success('Nota atualizada com sucesso!');
        return true;
      } else {
        showToast.error(result.error || 'Erro ao atualizar nota');
        return false;
      }
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      showToast.error('Ocorreu um erro ao atualizar a nota');
      return false;
    }
  }

  const deleteGrade = async (gradeId, subjectId) => {
    try {
      const result = await apiService.deleteGrade(subjectId, gradeId);
      
      if (result.success) {
        showToast.success('Nota excluída com sucesso!');
        return true;
      } else {
        showToast.error(result.error || 'Erro ao excluir nota');
        return false;
      }
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      showToast.error('Ocorreu um erro ao excluir a nota');
      return false;
    }
  }

  // Função para calcular a média de uma matéria
  const calculateSubjectAverage = (subject) => {
    if (!subject?.grades || subject.grades.length === 0) {
      return null
    }

    let totalWeight = 0
    let weightedSum = 0
    
    subject.grades.forEach(grade => {
      const value = parseFloat(grade.value)
      const weight = parseFloat(grade.weight)
      
      if (!isNaN(value) && !isNaN(weight)) {
        totalWeight += weight
        weightedSum += value * weight
      }
    })
    
    if (totalWeight > 0) {
      return (weightedSum / totalWeight).toFixed(2)
    }
    
    return null
  }

  return {
    subjects,
    currentSemester,
    loading,
    addSubject,
    updateSubject,
    deleteSubject,
    addGrade,
    updateGrade,
    deleteGrade,
    calculateSubjectAverage
  }
} 