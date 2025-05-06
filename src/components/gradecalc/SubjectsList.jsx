import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Edit, Trash2, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card'
import { motion } from 'framer-motion'
import { useState } from 'react'
import PropTypes from 'prop-types'

export function SubjectsList({ 
  subjects, 
  loading, 
  onViewSubject, 
  onEditSubject, 
  onDeleteSubject, 
  onAddSubject 
}) {
  const [hoveringDelete, setHoveringDelete] = useState(null)
  
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle>Matérias</CardTitle>
          <CardDescription>
            Gerencie suas matérias e notas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando matérias...</p>
            </div>
          ) : subjects.length > 0 ? (
            subjects.map((subject) => (
              <div key={subject.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div 
                  className="flex items-center gap-4 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onViewSubject(subject.id)}
                >
                  <span className="font-medium">{subject.name}</span>
                  <Badge variant="outline" className="px-2 py-1">
                    {subject.semester}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditSubject(subject)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button
                    variant={hoveringDelete === subject.id ? "destructive" : "ghost"}
                    size="icon"
                    onClick={() => onDeleteSubject('subject', subject.id)}
                    onMouseEnter={() => setHoveringDelete(subject.id)}
                    onMouseLeave={() => setHoveringDelete(null)}
                    title="Excluir matéria e todas as notas associadas"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma matéria cadastrada ainda.</p>
              <p className="mt-1 text-muted-foreground">Adicione sua primeira matéria!</p>
            </div>
          )}
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={onAddSubject}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Matéria
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Validação de props com PropTypes
SubjectsList.propTypes = {
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      semester: PropTypes.string.isRequired
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onViewSubject: PropTypes.func.isRequired,
  onEditSubject: PropTypes.func.isRequired,
  onDeleteSubject: PropTypes.func.isRequired,
  onAddSubject: PropTypes.func.isRequired
};

// Animações
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
}; 