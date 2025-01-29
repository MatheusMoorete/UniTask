import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { 
  collection, 
  addDoc, 
  deleteDoc,
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore'
import supabase, { signInToSupabase } from '../lib/supabase'

export function useCadernoVirtual() {
  const [materias, setMaterias] = useState([])
  const [materiais, setMateriais] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Carregar matérias do usuário
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'materias'),
      where('userId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const materiasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMaterias(materiasData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  // Carregar materiais do usuário
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'materiais'),
      where('userId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const materiaisData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMateriais(materiaisData)
    })

    return () => unsubscribe()
  }, [user])

  // Adicionar nova matéria
  const addMateria = async (nomeMateria) => {
    try {
      await addDoc(collection(db, 'materias'), {
        nome: nomeMateria,
        userId: user.uid,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao adicionar matéria:', error)
      throw error
    }
  }

  // Remover matéria
  const removeMateria = async (materiaId) => {
    try {
      // Primeiro remove todos os materiais da matéria
      const materiaisDaMateria = materiais.filter(m => m.materiaId === materiaId)
      for (const material of materiaisDaMateria) {
        await deleteDoc(doc(db, 'materiais', material.id))
      }
      
      // Depois remove a matéria
      await deleteDoc(doc(db, 'materias', materiaId))
    } catch (error) {
      console.error('Erro ao remover matéria:', error)
      throw error
    }
  }

  // Adicionar novo material
  const addMaterial = async (materiaId, material) => {
    try {
      await addDoc(collection(db, 'materiais'), {
        ...material,
        materiaId,
        userId: user.uid,
        anotacoes: 0,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao adicionar material:', error)
      throw error
    }
  }

  // Adicionar novo material com arquivo
  const addMaterialWithFile = async (materiaId, file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.uid}/${materiaId}/${fileName}`

      console.log('Tentando fazer upload:', {
        bucket: 'materiais',
        path: filePath,
        fileType: file.type,
        fileSize: file.size
      })

      const { error: uploadError, data } = await supabase.storage
        .from('materiais')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Erro de upload:', uploadError)
        throw uploadError
      }

      console.log('Upload bem sucedido:', data)

      // Construir a URL pública manualmente
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/materiais/${filePath}`

      await addDoc(collection(db, 'materiais'), {
        title: file.name,
        type: 'file',
        fileUrl: filePath,
        publicUrl,
        fileType: fileExt,
        fileSize: file.size,
        materiaId,
        userId: user.uid,
        anotacoes: 0,
        createdAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao adicionar material com arquivo:', error)
      throw error
    }
  }

  // Remover material e arquivo
  const removeMaterial = async (materialId, fileUrl) => {
    try {
      if (fileUrl) {
        // Remove o arquivo do Storage usando o caminho completo
        const { error: deleteError } = await supabase.storage
          .from('materiais')
          .remove([fileUrl]) // fileUrl já deve ter o formato correto userId/materiaId/filename

        if (deleteError) throw deleteError
      }

      // Remove o documento do Firestore
      await deleteDoc(doc(db, 'materiais', materialId))
    } catch (error) {
      console.error('Erro ao remover material:', error)
      throw error
    }
  }

  // Salvar anotações
  const saveHighlights = async (materialId, highlights) => {
    try {
      await setDoc(doc(db, 'anotacoes', materialId), {
        userId: user.uid,
        highlights,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao salvar anotações:', error)
      throw error
    }
  }

  // Carregar anotações
  const loadHighlights = async (materialId) => {
    try {
      const docRef = doc(db, 'anotacoes', materialId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return docSnap.data().highlights
      }
      return []
    } catch (error) {
      console.error('Erro ao carregar anotações:', error)
      return []
    }
  }

  return {
    materias,
    materiais,
    loading,
    addMateria,
    removeMateria,
    addMaterial,
    addMaterialWithFile,
    removeMaterial,
    saveHighlights,
    loadHighlights
  }
} 