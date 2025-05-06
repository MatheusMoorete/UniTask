import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useFirestore } from './FirestoreContext'
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { showToast } from '../lib/toast'

const SemesterContext = createContext({})

export function SemesterProvider({ children }) {
  const { user } = useAuth()
  const { db } = useFirestore()
  const [semesters, setSemesters] = useState([])
  const [currentSemester, setCurrentSemester] = useState(null)
  const [activeSemesterId, setActiveSemesterId] = useState(null)
  const [loading, setLoading] = useState(true)

  // Buscar semestres do usuário
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!user?.uid) {
        setSemesters([])
        setCurrentSemester(null)
        setActiveSemesterId(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const semestersQuery = query(
          collection(db, 'semesters'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(semestersQuery)
        const semestersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setSemesters(semestersData)

        // Se não houver semestres, cria um padrão
        if (semestersData.length === 0) {
          const defaultSemester = await createDefaultSemester()
          setCurrentSemester(defaultSemester)
          setActiveSemesterId(defaultSemester.id)
        } else {
          // Define o semestre ativo como o mais recente ou o que estava ativo anteriormente
          const activeSemester = semestersData.find(sem => sem.isActive) || semestersData[0]
          setCurrentSemester(activeSemester)
          setActiveSemesterId(activeSemester.id)
        }

        setLoading(false)
      } catch (error) {
        console.error("Erro ao carregar semestres:", error)
        showToast.error("Erro ao carregar informações do semestre")
        setLoading(false)
      }
    }

    fetchSemesters()
  }, [user, db])

  // Função para criar um semestre padrão
  const createDefaultSemester = async () => {
    try {
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      
      // Determina se é primeiro ou segundo semestre
      const semesterNumber = month < 6 ? 1 : 2
      
      const defaultSemester = {
        name: `${semesterNumber}º Semestre ${year}`,
        userId: user.uid,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'semesters'), defaultSemester)
      return {
        id: docRef.id,
        ...defaultSemester,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (error) {
      console.error("Erro ao criar semestre padrão:", error)
      showToast.error("Erro ao configurar semestre padrão")
      return null
    }
  }

  // Criar um novo semestre
  const createSemester = async (semesterName) => {
    try {
      // Desativa o semestre atual
      if (activeSemesterId) {
        await updateDoc(doc(db, 'semesters', activeSemesterId), {
          isActive: false,
          updatedAt: serverTimestamp()
        })
      }

      // Cria o novo semestre
      const newSemester = {
        name: semesterName,
        userId: user.uid,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'semesters'), newSemester)
      
      const createdSemester = {
        id: docRef.id,
        ...newSemester,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Atualiza o estado
      setSemesters(prev => [createdSemester, ...prev])
      setCurrentSemester(createdSemester)
      setActiveSemesterId(docRef.id)
      
      showToast.success(`Semestre "${semesterName}" criado com sucesso!`)
      return createdSemester
    } catch (error) {
      console.error("Erro ao criar novo semestre:", error)
      showToast.error("Erro ao criar novo semestre")
      return null
    }
  }

  // Trocar para um semestre existente
  const switchSemester = async (semesterId) => {
    try {
      // Desativa o semestre atual
      if (activeSemesterId) {
        await updateDoc(doc(db, 'semesters', activeSemesterId), {
          isActive: false,
          updatedAt: serverTimestamp()
        })
      }

      // Ativa o novo semestre
      await updateDoc(doc(db, 'semesters', semesterId), {
        isActive: true,
        updatedAt: serverTimestamp()
      })

      // Atualiza o estado
      const targetSemester = semesters.find(sem => sem.id === semesterId)
      if (targetSemester) {
        const updatedSemester = { ...targetSemester, isActive: true }
        setCurrentSemester(updatedSemester)
        setActiveSemesterId(semesterId)
        
        // Atualiza a lista de semestres
        setSemesters(prev => prev.map(sem => 
          sem.id === semesterId 
            ? { ...sem, isActive: true } 
            : { ...sem, isActive: false }
        ))
        
        return updatedSemester
      }
      
      return null
    } catch (error) {
      console.error("Erro ao trocar de semestre:", error)
      showToast.error("Erro ao trocar de semestre")
      return null
    }
  }

  // Atualizar nome do semestre atual
  const updateSemesterName = async (newName) => {
    if (!activeSemesterId) return null
    
    try {
      await updateDoc(doc(db, 'semesters', activeSemesterId), {
        name: newName,
        updatedAt: serverTimestamp()
      })

      // Atualiza o estado
      const updatedSemester = { ...currentSemester, name: newName }
      setCurrentSemester(updatedSemester)
      
      // Atualiza a lista de semestres
      setSemesters(prev => prev.map(sem => 
        sem.id === activeSemesterId 
          ? { ...sem, name: newName } 
          : sem
      ))
      
      showToast.success(`Nome do semestre atualizado para "${newName}"`)
      return updatedSemester
    } catch (error) {
      console.error("Erro ao atualizar nome do semestre:", error)
      showToast.error("Erro ao atualizar nome do semestre")
      return null
    }
  }

  // Função para adicionar o semestre atual a um objeto de dados 
  const withCurrentSemester = (data) => {
    if (!activeSemesterId) return data;
    
    return {
      ...data,
      semesterId: activeSemesterId
    };
  }

  // Função para criar uma query filtrada pelo semestre atual
  const createSemesterQuery = (collectionRef, userCondition = true) => {
    if (!activeSemesterId || !user?.uid) return null;
    
    const conditions = [];
    
    // Adicionar condição de usuário se necessário
    if (userCondition) {
      conditions.push(where('userId', '==', user.uid));
    }
    
    // Adicionar condição de semestre
    conditions.push(where('semesterId', '==', activeSemesterId));
    
    return query(collectionRef, ...conditions);
  }

  return (
    <SemesterContext.Provider 
      value={{ 
        semesters,
        currentSemester,
        activeSemesterId,
        loading,
        createSemester,
        switchSemester,
        updateSemesterName,
        withCurrentSemester,
        createSemesterQuery
      }}
    >
      {children}
    </SemesterContext.Provider>
  )
}

export const useSemester = () => {
  const context = useContext(SemesterContext)
  if (!context) {
    throw new Error('useSemester must be used within a SemesterProvider')
  }
  return context
} 