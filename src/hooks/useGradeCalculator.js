import { useState } from 'react'
import { showToast } from '../lib/toast'

export function useGradeCalculator() {
  // Estado para cálculo de média
  const [calcGrades, setCalcGrades] = useState([
    { grade: '', weight: '1' },
    { grade: '', weight: '1' },
    { grade: '', weight: '1' }
  ])
  const [weightedAverage, setWeightedAverage] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Estado para cálculo da nota final necessária
  const [examGrades, setExamGrades] = useState([
    { grade: '', weight: '1' },
    { grade: '', weight: '1' }
  ])
  const [finalExamWeight, setFinalExamWeight] = useState('1')
  const [minPassingGrade, setMinPassingGrade] = useState('6.0')
  const [finalGradeNeeded, setFinalGradeNeeded] = useState(null)

  // Funções para manipular as notas no cálculo de média
  const addCalcGrade = () => {
    if (calcGrades.length >= 10) {
      showToast.info('Você atingiu o limite máximo de 10 notas!')
      return
    }
    setCalcGrades([...calcGrades, { grade: '', weight: '1' }])
  }

  const removeCalcGrade = (index) => {
    if (calcGrades.length <= 1) {
      showToast.info('Você precisa ter pelo menos uma nota!')
      return
    }
    const newGrades = [...calcGrades]
    newGrades.splice(index, 1)
    setCalcGrades(newGrades)
  }

  const updateCalcGrade = (index, field, value) => {
    const newGrades = [...calcGrades]
    
    // Limitar entrada a números e ponto/vírgula
    if (field === 'grade' || field === 'weight') {
      value = value.replace(/[^0-9,.]/g, '')
      // Permitir apenas um separador decimal
      const decimalCount = (value.match(/[.,]/g) || []).length
      if (decimalCount > 1) {
        return
      }
      // Padronizar para usar vírgula como separador
      value = value.replace('.', ',')
    }
    
    newGrades[index][field] = value
    setCalcGrades(newGrades)
  }

  // Funções para manipular as notas no cálculo da nota final
  const addExamGrade = () => {
    if (examGrades.length >= 10) {
      showToast.info('Você atingiu o limite máximo de 10 notas!')
      return
    }
    setExamGrades([...examGrades, { grade: '', weight: '1' }])
  }

  const removeExamGrade = (index) => {
    if (examGrades.length <= 1) {
      showToast.info('Você precisa ter pelo menos uma nota!')
      return
    }
    const newGrades = [...examGrades]
    newGrades.splice(index, 1)
    setExamGrades(newGrades)
  }

  const updateExamGrade = (index, field, value) => {
    const newGrades = [...examGrades]
    
    // Limitar entrada a números e ponto/vírgula
    if (field === 'grade' || field === 'weight') {
      value = value.replace(/[^0-9,.]/g, '')
      // Permitir apenas um separador decimal
      const decimalCount = (value.match(/[.,]/g) || []).length
      if (decimalCount > 1) {
        return
      }
      // Padronizar para usar vírgula como separador
      value = value.replace('.', ',')
    }
    
    newGrades[index][field] = value
    setExamGrades(newGrades)
  }

  // Funções para resetar formulários
  const resetAverageForm = () => {
    setCalcGrades([
      { grade: '', weight: '1' },
      { grade: '', weight: '1' },
      { grade: '', weight: '1' }
    ])
    setWeightedAverage(null)
  }

  const resetExamForm = () => {
    setExamGrades([
      { grade: '', weight: '1' },
      { grade: '', weight: '1' }
    ])
    setFinalExamWeight('1')
    setMinPassingGrade('6.0')
    setFinalGradeNeeded(null)
  }

  // Funções de cálculo
  const calculateAverage = () => {
    // Validar se pelo menos uma nota foi preenchida
    const validGrades = calcGrades.filter(g => g.grade !== '')
    if (validGrades.length === 0) {
      showToast.error('Informe pelo menos uma nota!')
      return
    }

    setIsCalculating(true)

    // Simular um breve processamento
    setTimeout(() => {
      try {
        let totalWeight = 0
        let weightedSum = 0

        calcGrades.forEach(g => {
          if (g.grade !== '') {
            const grade = parseFloat(g.grade.replace(',', '.'))
            const weight = parseFloat(g.weight.replace(',', '.'))
            
            if (isNaN(grade) || isNaN(weight)) {
              throw new Error('Notas e pesos devem ser números válidos')
            }
            
            if (grade < 0 || grade > 10) {
              throw new Error('As notas devem estar entre 0 e 10')
            }
            
            if (weight <= 0) {
              throw new Error('Os pesos devem ser maiores que zero')
            }
            
            totalWeight += weight
            weightedSum += grade * weight
          }
        })

        if (totalWeight > 0) {
          const average = (weightedSum / totalWeight).toFixed(2)
          setWeightedAverage(average.replace('.', ','))
        } else {
          throw new Error('A soma dos pesos deve ser maior que zero')
        }
      } catch (error) {
        showToast.error(error.message || 'Erro ao calcular a média')
      } finally {
        setIsCalculating(false)
      }
    }, 500)
  }

  const calculateFinalGrade = () => {
    // Validar se pelo menos uma nota foi preenchida
    const validGrades = examGrades.filter(g => g.grade !== '')
    if (validGrades.length === 0) {
      showToast.error('Informe pelo menos uma nota!')
      return
    }

    setIsCalculating(true)

    // Simular um breve processamento
    setTimeout(() => {
      try {
        // Validações
        const examWeight = parseFloat(finalExamWeight.replace(',', '.'))
        const passingGrade = parseFloat(minPassingGrade.replace(',', '.'))
        
        if (isNaN(examWeight) || examWeight <= 0) {
          throw new Error('O peso da prova final deve ser maior que zero')
        }
        
        if (isNaN(passingGrade) || passingGrade < 0 || passingGrade > 10) {
          throw new Error('A nota mínima para aprovação deve estar entre 0 e 10')
        }
        
        // Calcular a média atual e peso total
        let currentWeight = 0
        let currentWeightedSum = 0
        
        examGrades.forEach(g => {
          if (g.grade !== '') {
            const grade = parseFloat(g.grade.replace(',', '.'))
            const weight = parseFloat(g.weight.replace(',', '.'))
            
            if (isNaN(grade) || isNaN(weight)) {
              throw new Error('Notas e pesos devem ser números válidos')
            }
            
            if (grade < 0 || grade > 10) {
              throw new Error('As notas devem estar entre 0 e 10')
            }
            
            if (weight <= 0) {
              throw new Error('Os pesos devem ser maiores que zero')
            }
            
            currentWeight += weight
            currentWeightedSum += grade * weight
          }
        })
        
        // Calcular a nota necessária na prova final
        const totalWeight = currentWeight + examWeight
        const neededWeightedSum = passingGrade * totalWeight
        const neededGrade = (neededWeightedSum - currentWeightedSum) / examWeight
        
        // Limitar a nota necessária entre 0 e 10
        let finalNeededGrade = Math.max(0, Math.min(10, neededGrade))
        
        // Verificar se já está aprovado
        if (neededGrade <= 0) {
          showToast.success('Você já atingiu a média necessária para aprovação!')
          finalNeededGrade = 0
        } else if (neededGrade > 10) {
          showToast.error('Mesmo com nota 10, você não conseguirá atingir a média necessária.')
          finalNeededGrade = 10
        }
        
        // Formatar a nota necessária
        setFinalGradeNeeded(finalNeededGrade.toFixed(2).replace('.', ','))
      } catch (error) {
        showToast.error(error.message || 'Erro ao calcular a nota necessária')
      } finally {
        setIsCalculating(false)
      }
    }, 500)
  }

  return {
    // Estado
    calcGrades,
    weightedAverage,
    isCalculating,
    examGrades,
    finalExamWeight,
    minPassingGrade,
    finalGradeNeeded,
    
    // Setters
    setFinalExamWeight,
    setMinPassingGrade,
    
    // Funções
    addCalcGrade,
    removeCalcGrade,
    updateCalcGrade,
    addExamGrade,
    removeExamGrade,
    updateExamGrade,
    resetAverageForm,
    resetExamForm,
    calculateAverage,
    calculateFinalGrade
  }
} 