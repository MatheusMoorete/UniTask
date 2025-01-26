import React, { useState, useEffect } from 'react'
import { Search, Plus, FileText, Book, Trash2, ExternalLink, Maximize2, Minimize2, MessageSquare, Highlighter, Bookmark, List, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { useDropzone } from 'react-dropzone'
import { AddMateriaDialog } from '../components/notebook/AddMateriaDialog'
import { AddConteudoMenu } from '../components/notebook/AddConteudoMenu'
import { AddTextDialog } from '../components/notebook/AddTextDialog'
import { useCadernoVirtual } from '../hooks/useCadernoVirtual'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '../components/ui/dialog'
import { Worker } from '@react-pdf-viewer/core'
import { Viewer } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { highlightPlugin, Popup } from '@react-pdf-viewer/highlight'
import { toolbarPlugin } from '@react-pdf-viewer/toolbar'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import '@react-pdf-viewer/highlight/lib/styles/index.css'
import '@react-pdf-viewer/toolbar/lib/styles/index.css'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Label } from '../components/ui/label'

export function CadernoVirtual() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDisciplina, setSelectedDisciplina] = useState(null)
  const [isAddMateriaOpen, setIsAddMateriaOpen] = useState(false)
  const [isAddTextOpen, setIsAddTextOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [highlights, setHighlights] = useState({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isHighlightMode, setIsHighlightMode] = useState(false)
  const [bookmarks, setBookmarks] = useState({})
  const [activeHighlight, setActiveHighlight] = useState(null)
  const [selectedText, setSelectedText] = useState(null)
  const [pendingHighlight, setPendingHighlight] = useState(null)
  
  const { 
    materias, 
    materiais, 
    loading, 
    addMateria, 
    removeMateria, 
    addMaterial,
    addMaterialWithFile,
    removeMaterial 
  } = useCadernoVirtual()
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: files => {
      console.log('Arquivos recebidos:', files)
      // TODO: Implementar upload
    }
  })

  // Filtra materiais baseado na matéria selecionada
  const filteredMateriais = materiais.filter(material => 
    material.materiaId === selectedDisciplina &&
    (!searchTerm || material.title.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Encontra a matéria selecionada
  const currentMateria = materias.find(m => m.id === selectedDisciplina)

  const handleAddMateria = async (nomeMateria) => {
    try {
      await addMateria(nomeMateria)
    } catch (error) {
      // Adicione tratamento de erro aqui
      console.error(error)
    }
  }

  const handleRemoveMateria = async (materiaId) => {
    if (window.confirm('Tem certeza que deseja remover esta matéria? Todos os materiais serão removidos também.')) {
      try {
        await removeMateria(materiaId)
        if (selectedDisciplina === materiaId) {
          setSelectedDisciplina(null)
        }
      } catch (error) {
        // Adicione tratamento de erro aqui
        console.error(error)
      }
    }
  }

  const handleNewText = () => {
    setIsAddTextOpen(true)
  }

  const handleNewFile = () => {
    // Abre o seletor de arquivo nativo
    document.getElementById('file-input').click()
  }

  const handleMateriaSelect = (materiaId) => {
    setSelectedDisciplina(materiaId)
  }

  const handleSaveText = async (newText) => {
    if (!selectedDisciplina) return

    try {
      await addMaterial(selectedDisciplina, {
        title: newText.title,
        content: newText.content,
        type: 'text',
        anotacoes: 0
      })
    } catch (error) {
      // Adicione tratamento de erro aqui
      console.error(error)
    }
  }

  const handleFileUpload = async (event) => {
    if (!selectedDisciplina) return
    
    const file = event.target.files[0]
    if (file) {
      try {
        await addMaterialWithFile(selectedDisciplina, file)
      } catch (error) {
        // Adicione tratamento de erro aqui
        console.error(error)
      }
    }
  }

  // Função para remover material
  const handleRemoveMaterial = async (material) => {
    toast.custom((t) => (
      <div className="bg-white rounded-lg shadow-lg p-4 border">
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-1">Confirmar remoção</h3>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover "{material.title}"?
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.dismiss(t)}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={async () => {
              toast.dismiss(t)
              try {
                await removeMaterial(material.id, material.fileUrl)
                toast.success('Material removido com sucesso!')
              } catch (error) {
                toast.error('Erro ao remover material')
                console.error(error)
              }
            }}
          >
            Remover
          </Button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center'
    })
  }

  // Função auxiliar para formatar o contador de materiais
  const formatMaterialCount = (count) => {
    if (count === 0) return ''
    if (count === 1) return '1 conteúdo'
    return `${count} conteúdos`
  }

  // Função para abrir o arquivo
  const handleFileClick = (material) => {
    if (material.type === 'file') {
      setSelectedFile(material)
    }
  }

  const toolbarPluginInstance = toolbarPlugin()
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    toolbarPlugin: toolbarPluginInstance,
  })
  
  const CustomToolbar = () => (
    <div className="flex items-center gap-2 p-2 border-b bg-background">
      <Button
        variant={isHighlightMode ? "default" : "ghost"}
        size="sm"
        onClick={() => {
          setIsHighlightMode(!isHighlightMode)
          if (!isHighlightMode) {
            toast.info('Modo marcação ativado: selecione o texto que deseja destacar', {
              duration: 2000,
              position: 'bottom-center'
            })
          }
        }}
        className="flex items-center gap-2"
      >
        <Highlighter className="h-4 w-4" />
        {isHighlightMode ? 'Desativar marcação' : 'Ativar marcação'}
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Ver marcações
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marcações</DialogTitle>
            <DialogDescription>
              Todas as marcações feitas neste documento
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {highlights[selectedFile?.id]?.length > 0 ? (
              <div className="space-y-2">
                {highlights[selectedFile.id].map((highlight, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
                    onClick={() => {
                      // Implementar scroll até a marcação
                    }}
                  >
                    <p className="text-sm font-medium line-clamp-2">
                      {highlight.content.text}
                    </p>
                    {highlight.comment && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {highlight.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma marcação encontrada
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  // Efeito para lidar com a seleção de texto
  useEffect(() => {
    if (pendingHighlight) {
      setActiveHighlight(pendingHighlight)
      setPendingHighlight(null)
    }
  }, [pendingHighlight])

  const highlightPluginInstance = highlightPlugin({
    enableAreaSelection: true,
    renderHighlightTarget: (props) => {
      if (!isHighlightMode || !props.selectionRegion || !props.selectedText?.trim()) return null

      return (
        <div
          style={{
            background: '#ffeb3b',
            padding: '4px',
            borderRadius: '4px',
            cursor: 'pointer',
            position: 'absolute',
            zIndex: 1,
            ...props.selectionRegion,
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            
            const newHighlight = {
              content: { text: props.selectedText.trim() },
              position: props.selectionRegion,
              comment: '',
              pageIndex: props.pageIndex,
            }

            setPendingHighlight(newHighlight)
          }}
        >
          Marcar texto
        </div>
      )
    },
    renderHighlight: (props) => (
      <div
        style={{
          background: 'rgba(255, 235, 59, 0.4)',
          position: 'absolute',
          cursor: 'pointer',
        }}
        {...props.attrs}
        onClick={() => {
          if (props.annotation?.comment) {
            toast.custom((t) => (
              <div className="bg-white rounded-lg shadow-lg p-4 border max-w-sm">
                <div className="mb-2">
                  <p className="text-sm font-medium mb-1">Texto marcado:</p>
                  <p className="text-sm text-muted-foreground">
                    {props.annotation.content.text}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Anotação:</p>
                  <p className="text-sm text-muted-foreground">
                    {props.annotation.comment}
                  </p>
                </div>
              </div>
            ), {
              duration: 3000,
              position: 'bottom-center'
            })
          }
        }}
      />
    )
  })

  // Dialog para adicionar comentário à marcação
  const CommentDialog = () => (
    <Dialog 
      open={!!activeHighlight} 
      onOpenChange={(open) => {
        if (!open) {
          setActiveHighlight(null)
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar anotação</DialogTitle>
          <DialogDescription>
            Adicione um comentário opcional para esta marcação
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Texto selecionado</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {activeHighlight?.content.text}
            </p>
          </div>
          <div>
            <Label>Comentário (opcional)</Label>
            <textarea
              className="w-full p-2 border rounded-md text-sm mt-1"
              rows={3}
              placeholder="Digite seu comentário aqui..."
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              saveHighlight(activeHighlight)
              setActiveHighlight(null)
            }}
          >
            Salvar sem comentário
          </Button>
          <Button
            onClick={() => {
              const comment = document.querySelector('textarea').value.trim()
              saveHighlight({ ...activeHighlight, comment })
              setActiveHighlight(null)
            }}
          >
            Salvar com comentário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  const saveHighlight = (highlight) => {
    if (!highlight) return

    setHighlights(prev => ({
      ...prev,
      [selectedFile?.id]: [...(prev[selectedFile?.id] || []), highlight]
    }))

    toast.success('Marcação salva com sucesso!', {
      position: 'bottom-center',
      duration: 2000
    })
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <div className="h-full flex">
        {/* Conteúdo Principal (Agora à esquerda) */}
        <div className="flex-1 flex flex-col">
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                {currentMateria ? currentMateria.nome : 'Selecione uma matéria'}
              </h1>
              <AddConteudoMenu 
                onNewText={handleNewText}
                onNewFile={handleNewFile}
                disabled={!selectedDisciplina}
              />
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              {currentMateria && filteredMateriais.length > 0 && (
                <span>{formatMaterialCount(filteredMateriais.length)}</span>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="relative mb-6">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
                placeholder="Buscar material..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMateriais.map((material) => (
                <Card 
                  key={material.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleFileClick(material)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">{material.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {material.type === 'file' && (
                        <a 
                          href={`${import.meta.env.VITE_SUPABASE_PUBLIC_BUCKET_URL}/${material.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveMaterial(material)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
      </div>

            {(!selectedDisciplina || filteredMateriais.length === 0) && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Book className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  {!selectedDisciplina 
                    ? 'Selecione uma matéria para começar'
                    : 'Nenhum material encontrado'
                  }
                </h3>
                <p className="text-muted-foreground">
                  {!selectedDisciplina 
                    ? 'Escolha uma matéria no menu lateral'
                    : 'Comece adicionando um novo material para esta matéria'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Agora à direita) */}
        <div className="w-[350px] border-l p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Minhas Matérias</h2>
            <Button
              variant="ghost"
                size="icon"
                onClick={() => setIsAddMateriaOpen(true)}
            >
                <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar matéria..."
              className="pl-8 bg-white"
            />
          </div>

          <div className="space-y-1">
            {materias.map((materia) => {
              const materiaCount = materiais.filter(m => m.materiaId === materia.id).length
              
              return (
                <div key={materia.id} className="group flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className={`flex-1 justify-start text-left font-normal hover:bg-accent/10 
                      ${selectedDisciplina === materia.id ? 'bg-accent/10 text-accent' : ''}`}
                    onClick={() => handleMateriaSelect(materia.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="flex-1">{materia.nome}</span>
                    {materiaCount > 0 && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatMaterialCount(materiaCount)}
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveMateria(materia.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
          </div>
              )
            })}
          </div>
        </div>

        <AddMateriaDialog 
          open={isAddMateriaOpen}
          onOpenChange={setIsAddMateriaOpen}
          onAdd={handleAddMateria}
        />

        <input
          type="file"
          id="file-input"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.txt"
        />
        
        <AddTextDialog
          open={isAddTextOpen}
          onOpenChange={setIsAddTextOpen}
          onSave={handleSaveText}
        />
      </div>

      {/* Dialog para visualizar arquivo */}
      <Dialog 
        open={!!selectedFile} 
        onOpenChange={() => {
          setSelectedFile(null)
          setIsFullscreen(false)
        }}
      >
        <DialogContent className={`p-0 gap-0 transition-all duration-200 ${
          isFullscreen 
            ? 'max-w-[100vw] max-h-[100vh] rounded-none' 
            : 'max-w-[95vw] max-h-[95vh]'
        }`}>
          <VisuallyHidden>
            <DialogTitle>Visualizador de PDF</DialogTitle>
            <DialogDescription>
              Visualizando arquivo PDF com opções de anotação
            </DialogDescription>
          </VisuallyHidden>
          {selectedFile && (
            <div className="flex flex-col h-full">
              <CustomToolbar />
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 overflow-hidden relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-16 right-2 z-50 bg-background/80 hover:bg-background shadow-sm"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                    <div style={{ 
                      height: isFullscreen ? '100vh' : 'calc(95vh - 60px)'
                    }}>
                      <Viewer
                        fileUrl={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/materiais/${selectedFile.fileUrl}`}
                        plugins={[
                          defaultLayoutPluginInstance,
                          highlightPluginInstance,
                          toolbarPluginInstance,
                        ]}
                        defaultScale={1}
                        highlights={highlights[selectedFile.id] || []}
                        renderLoader={(percentages) => (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Carregando PDF... {Math.round(percentages)}%
                              </p>
                            </div>
                          </div>
                        )}
                        onDocumentLoad={() => {
                          // Limpar highlights ao carregar novo documento
                          setHighlights(prev => ({...prev, [selectedFile.id]: []}))
                        }}
                      />
                    </div>
                  </Worker>
                </div>

                <div className={`flex justify-between items-center p-4 border-t bg-background ${
                  isFullscreen ? 'hidden' : ''
                }`}>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">
                      {(highlights[selectedFile.id] || []).length} anotações
                    </span>
                  </div>
                  <Button asChild>
                    <a
                      href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/materiais/${selectedFile.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir em nova aba
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CommentDialog />

      <Toaster 
        position="top-center"
        expand={false}
        richColors
        toastOptions={{
          className: 'border border-border',
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
    </>
  )
} 