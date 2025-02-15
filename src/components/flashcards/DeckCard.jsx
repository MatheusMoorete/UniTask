//Card indicidual para cada deck
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Card, CardHeader, CardContent } from '../ui/card'
import PropTypes from 'prop-types'
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
  Palette,
  Clock
} from 'lucide-react'
import { cn } from '../../lib/utils'

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
      className={cn(
        "group relative overflow-hidden transition-all h-[160px]",
        "cursor-pointer hover:border-primary/50 flex flex-col",
        "hover:shadow-lg hover:shadow-primary/5",
        "bg-gradient-to-br from-card to-card/50"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3 flex-none">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-2.5 rounded-xl transition-all duration-300",
            "bg-primary/5 group-hover:bg-primary/10",
            "group-hover:scale-105"
          )}>
            {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg tracking-tight truncate">{deck.name}</h3>
            <p className="text-sm text-muted-foreground/80 line-clamp-1">
              {deck.description || "Sem descrição"}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex items-center justify-between pb-3 text-sm flex-1">
        <div className="flex items-center gap-2.5 text-muted-foreground/90 bg-muted/30 px-3 py-2 rounded-md transition-colors group-hover:bg-muted/50">
          <Brain className="h-4 w-4 flex-none text-primary/70" />
          <span className="font-medium">{stats.totalCards} cards no total</span>
        </div>
        
        {stats.dueCards > 0 && (
          <div className="flex items-center gap-2.5 text-primary bg-primary/10 px-3 py-2 rounded-md transition-colors group-hover:bg-primary/15">
            <Clock className="h-4 w-4 flex-none" />
            <span className="font-medium">{stats.dueCards} para revisar</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

DeckCard.propTypes = {
  deck: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired
}
