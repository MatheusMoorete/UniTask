import { useState } from 'react'
import { Plus, Search, Filter, Calendar } from 'lucide-react'
import { Button } from '../components/ui/button'
import { StudyTopicsList } from '../components/study/StudyTopicsList'
import { CreateStudyTopicDialog } from '../components/study/CreateStudyTopicDialog'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { motion } from 'framer-motion'

export default function StudyRoom() {
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  // Animação para os elementos da página
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <motion.div 
      className="space-y-6 max-w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Cabeçalho */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Sala de Estudos
          </h2>
          <p className="text-muted-foreground mt-1">
            Organize suas provas, tópicos de estudo e acompanhe seu progresso
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateTopicOpen(true)}
          className="w-full sm:w-auto"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Prova
        </Button>
      </motion.div>

      {/* Filtros e Pesquisa */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-3"
        variants={itemVariants}
      >
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar provas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="in-progress">Em Progresso</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Data da Prova</SelectItem>
            <SelectItem value="progress">Progresso</SelectItem>
            <SelectItem value="topics">Quantidade de Tópicos</SelectItem>
            <SelectItem value="created">Data de Criação</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Lista de Tópicos */}
      <motion.div variants={itemVariants}>
        <StudyTopicsList 
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          sortBy={sortBy}
        />
      </motion.div>

      <CreateStudyTopicDialog 
        open={isCreateTopicOpen}
        onOpenChange={setIsCreateTopicOpen}
      />
    </motion.div>
  )
} 