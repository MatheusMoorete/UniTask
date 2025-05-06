import { useEffect, useState, useCallback } from 'react'
import { collection, query, where, onSnapshot, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../contexts/AuthContext'
import { useFirestore } from '../contexts/FirestoreContext'
import { useSemester } from '../contexts/SemesterContext'
import { showToast } from '../lib/toast'

/**
 * Hook para gerenciar dados com filtragem por semestre
 * @param {string} collectionName - Nome da coleção no Firestore
 * @param {object} options - Opções de configuração
 * @returns {object} - Objeto com dados e funções para manipulação
 */
export function useSemesterData(collectionName, options = {}) {
  const { user } = useAuth()
  const { db } = useFirestore()
  const { activeSemesterId, withCurrentSemester } = useSemester()
  
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const {
    additionalFilters = [],   // Filtros adicionais para a consulta
    includeTotalCount = false, // Se deve incluir contagem total
    onDataChange = null,      // Callback quando os dados mudam
    dependencies = []         // Dependências adicionais para o useEffect
  } = options
  
  // Função para buscar dados com filtragem por semestre
  const fetchData = useCallback(async () => {
    if (!user?.uid || !activeSemesterId) {
      setData([])
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Criar consulta base
      let conditions = [
        where('userId', '==', user.uid),
        where('semesterId', '==', activeSemesterId)
      ]
      
      // Adicionar filtros adicionais, se houver
      if (additionalFilters && additionalFilters.length > 0) {
        conditions = [...conditions, ...additionalFilters]
      }
      
      const dataQuery = query(collection(db, collectionName), ...conditions)
      
      // Executar consulta
      const snapshot = await getDocs(dataQuery)
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setData(items)
      
      // Chamar callback se fornecido
      if (onDataChange) {
        onDataChange(items)
      }
      
      return items
    } catch (err) {
      console.error(`Erro ao buscar dados de ${collectionName}:`, err)
      setError(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [user, db, activeSemesterId, collectionName, ...additionalFilters, ...dependencies])
  
  // Configurar listener em tempo real
  useEffect(() => {
    if (!user?.uid || !activeSemesterId) {
      setData([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    
    // Criar consulta base
    let conditions = [
      where('userId', '==', user.uid),
      where('semesterId', '==', activeSemesterId)
    ]
    
    // Adicionar filtros adicionais, se houver
    if (additionalFilters && additionalFilters.length > 0) {
      conditions = [...conditions, ...additionalFilters]
    }
    
    const dataQuery = query(collection(db, collectionName), ...conditions)
    
    // Configurar listener
    const unsubscribe = onSnapshot(dataQuery, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setData(items)
        setLoading(false)
        
        // Chamar callback se fornecido
        if (onDataChange) {
          onDataChange(items)
        }
      },
      (err) => {
        console.error(`Erro ao escutar alterações em ${collectionName}:`, err)
        setError(err)
        setLoading(false)
      }
    )
    
    // Limpar listener ao desmontar
    return () => unsubscribe()
  }, [user, db, activeSemesterId, collectionName, ...additionalFilters, ...dependencies])
  
  // Função para adicionar um item
  const addItem = async (itemData) => {
    if (!user?.uid || !activeSemesterId) {
      showToast.error('Não foi possível adicionar o item: semestre não selecionado')
      return null
    }
    
    try {
      // Adicionar dados de usuário e semestre
      const dataWithSemester = withCurrentSemester({
        ...itemData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Adicionar ao Firestore
      const docRef = await addDoc(collection(db, collectionName), dataWithSemester)
      
      // Retornar ID do novo documento
      return docRef.id
    } catch (err) {
      console.error(`Erro ao adicionar item em ${collectionName}:`, err)
      showToast.error(`Erro ao adicionar item: ${err.message}`)
      return null
    }
  }
  
  // Função para atualizar um item
  const updateItem = async (itemId, itemData) => {
    if (!user?.uid || !activeSemesterId) {
      showToast.error('Não foi possível atualizar o item: semestre não selecionado')
      return false
    }
    
    try {
      // Verificar se o item existe e pertence ao usuário/semestre correto
      const itemRef = doc(db, collectionName, itemId)
      const itemSnap = await getDoc(itemRef)
      
      if (!itemSnap.exists()) {
        showToast.error('Item não encontrado')
        return false
      }
      
      const existingData = itemSnap.data()
      if (existingData.userId !== user.uid || existingData.semesterId !== activeSemesterId) {
        showToast.error('Você não tem permissão para editar este item')
        return false
      }
      
      // Preparar dados para atualização
      const updateData = {
        ...itemData,
        updatedAt: serverTimestamp()
      }
      
      // Atualizar no Firestore
      await updateDoc(itemRef, updateData)
      return true
    } catch (err) {
      console.error(`Erro ao atualizar item em ${collectionName}:`, err)
      showToast.error(`Erro ao atualizar item: ${err.message}`)
      return false
    }
  }
  
  // Função para excluir um item
  const deleteItem = async (itemId) => {
    if (!user?.uid || !activeSemesterId) {
      showToast.error('Não foi possível excluir o item: semestre não selecionado')
      return false
    }
    
    try {
      // Verificar se o item existe e pertence ao usuário/semestre correto
      const itemRef = doc(db, collectionName, itemId)
      const itemSnap = await getDoc(itemRef)
      
      if (!itemSnap.exists()) {
        showToast.error('Item não encontrado')
        return false
      }
      
      const existingData = itemSnap.data()
      if (existingData.userId !== user.uid || existingData.semesterId !== activeSemesterId) {
        showToast.error('Você não tem permissão para excluir este item')
        return false
      }
      
      // Excluir do Firestore
      await deleteDoc(itemRef)
      return true
    } catch (err) {
      console.error(`Erro ao excluir item em ${collectionName}:`, err)
      showToast.error(`Erro ao excluir item: ${err.message}`)
      return false
    }
  }
  
  // Função para obter um item específico
  const getItem = async (itemId) => {
    if (!user?.uid || !activeSemesterId) {
      return null
    }
    
    try {
      const itemRef = doc(db, collectionName, itemId)
      const itemSnap = await getDoc(itemRef)
      
      if (!itemSnap.exists()) {
        return null
      }
      
      const itemData = itemSnap.data()
      
      // Verificar se pertence ao usuário e semestre correto
      if (itemData.userId !== user.uid || itemData.semesterId !== activeSemesterId) {
        return null
      }
      
      return {
        id: itemId,
        ...itemData
      }
    } catch (err) {
      console.error(`Erro ao buscar item em ${collectionName}:`, err)
      return null
    }
  }
  
  return {
    data,
    loading,
    error,
    fetchData,
    addItem,
    updateItem,
    deleteItem,
    getItem
  }
} 