//Card indicidual para cada deck
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Card } from '../ui/card'
import { 
  Brain, 
  Book, 
  GraduationCap, 
  Library, 
  Lightbulb, 
  Microscope, 
  Rocket,
  Atom,
  Code,
  Palette
} from 'lucide-react'

// Função para gerar um número consistente baseado no ID
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

const icons = [
  Brain, 
  Book,
  GraduationCap,
  Library,
  Lightbulb,
  Microscope,
  Rocket,
  Atom,
  Code,
  Palette
]

export function DeckCard({ deck, onClick }) {
  const [stats, setStats] = useState({
    totalCards: 0,
    dueCards: 0
  })

  // Seleciona um ícone baseado no ID do deck
  const IconComponent = icons[hashCode(deck.id) % icons.length]

  useEffect(() => {
    async function loadDeckStats() {
      const q = query(
        collection(db, 'flashcards'),
        where('deckId', '==', deck.id)
      )

      const querySnapshot = await getDocs(q)
      const flashcards = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      const now = new Date()
      now.setHours(0, 0, 0, 0)

      const dueCards = flashcards.filter(card => {
        const nextReview = new Date(card.repetitionData.nextReview)
        nextReview.setHours(0, 0, 0, 0)
        return nextReview <= now
      }).length

      setStats({
        totalCards: flashcards.length,
        dueCards
      })
    }

    loadDeckStats()
  }, [deck.id])

  return (
    <Card
      className="p-6 cursor-pointer hover:bg-accent/5 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{deck.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{deck.description}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-4 text-sm">
        <div>
          <span className="font-medium">Cards: </span>
          <span className="text-muted-foreground">{stats.totalCards}</span>
        </div>
        <div>
          <span className="font-medium">Para revisar: </span>
          <span className="text-muted-foreground">{stats.dueCards}</span>
        </div>
      </div>
    </Card>
  )
}
