import { useState } from 'react'
import { 
  BookOpen, 
  ChevronDown, 
  Pencil, 
  Check,
  PlusCircle,
  CalendarDays,
  RotateCcw,
  Clock
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useSemester } from '../../contexts/SemesterContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { showToast } from '../../lib/toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function SemesterSelector({ variant = 'default' }) {
  const { 
    currentSemester, 
    semesters,
    loading,
    createSemester,
    switchSemester,
    updateSemesterName 
  } = useSemester()

  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState('')
  const [showNewSemesterDialog, setShowNewSemesterDialog] = useState(false)
  const [newSemesterName, setNewSemesterName] = useState('')

  // Se ainda estiver carregando ou sem semestre atual, mostra um placeholder
  if (loading || !currentSemester) {
    if (variant === 'compact') {
      return (
        <div className="flex items-center gap-2 bg-accent/10 px-3 py-1 rounded-lg animate-pulse">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-xs">Carregando semestre...</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-lg animate-pulse">
        <BookOpen className="h-5 w-5 text-primary" />
        <span className="font-medium">Carregando semestre...</span>
      </div>
    )
  }

  const handleEditClick = () => {
    setTempName(currentSemester.name)
    setIsEditing(true)
  }

  const handleSaveSemesterName = async () => {
    if (tempName.trim() === '') {
      showToast.error('O nome do semestre não pode estar vazio')
      return
    }

    await updateSemesterName(tempName)
    setIsEditing(false)
  }

  const handleCreateSemester = async () => {
    if (newSemesterName.trim() === '') {
      showToast.error('Digite um nome para o novo semestre')
      return
    }

    await createSemester(newSemesterName)
    setShowNewSemesterDialog(false)
    setNewSemesterName('')
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data desconhecida'
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  // Versão compacta para uso no cabeçalho
  if (variant === 'compact') {
    return (
      <>
        <div className="flex flex-col space-y-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-8 text-sm"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveSemesterName}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-medium">{currentSemester.name}</span>
                </div>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleEditClick}>
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between text-xs">
                    <span>Alterar Semestre</span>
                    <ChevronDown className="h-3 w-3 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm font-semibold">Semestres</span>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <DropdownMenuSeparator />
                  
                  {semesters.map(semester => (
                    <DropdownMenuItem
                      key={semester.id}
                      disabled={semester.id === currentSemester.id}
                      onClick={() => switchSemester(semester.id)}
                      className="flex flex-col items-start"
                    >
                      <div className="flex justify-between w-full">
                        <span className="font-medium">{semester.name}</span>
                        {semester.id === currentSemester.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Criado em {formatDate(semester.createdAt)}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowNewSemesterDialog(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>Criar novo semestre</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Diálogo para criar novo semestre */}
        <Dialog open={showNewSemesterDialog} onOpenChange={setShowNewSemesterDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar novo semestre</DialogTitle>
              <DialogDescription>
                Ao criar um novo semestre, seus dados serão isolados do semestre atual,
                permitindo que você mantenha históricos separados por período acadêmico.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center space-x-2 py-4">
              <div className="grid flex-1 gap-2">
                <label htmlFor="newSemesterName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Nome do semestre
                </label>
                <Input
                  id="newSemesterName"
                  placeholder="Ex: 1º Semestre 2025"
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewSemesterDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSemester} type="submit">
                <PlusCircle className="h-4 w-4 mr-2" />
                Criar novo semestre
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-lg">
        <BookOpen className="h-5 w-5 text-primary" />
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={handleSaveSemesterName}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-medium">{currentSemester.name}</span>
            <Button size="sm" variant="ghost" onClick={handleEditClick}>
              <Pencil className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm font-semibold">Semestres</span>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>
                <DropdownMenuSeparator />
                
                {semesters.map(semester => (
                  <DropdownMenuItem
                    key={semester.id}
                    disabled={semester.id === currentSemester.id}
                    onClick={() => switchSemester(semester.id)}
                    className="flex flex-col items-start"
                  >
                    <div className="flex justify-between w-full">
                      <span className="font-medium">{semester.name}</span>
                      {semester.id === currentSemester.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Criado em {formatDate(semester.createdAt)}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowNewSemesterDialog(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span>Criar novo semestre</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Diálogo para criar novo semestre */}
      <Dialog open={showNewSemesterDialog} onOpenChange={setShowNewSemesterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar novo semestre</DialogTitle>
            <DialogDescription>
              Ao criar um novo semestre, suas tarefas e configurações serão reiniciadas,
              mas os dados do semestre atual serão preservados e você poderá acessá-los a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <label htmlFor="newSemesterName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Nome do semestre
              </label>
              <Input
                id="newSemesterName"
                placeholder="Ex: 1º Semestre 2025"
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSemesterDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSemester} type="submit">
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar novo semestre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 