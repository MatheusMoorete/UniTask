import React, { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useDropzone } from 'react-dropzone'
import { Search, Tag, Folder, Upload } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export function CadernoVirtual() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDisciplina, setSelectedDisciplina] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: files => {
      console.log('Arquivos recebidos:', files)
      // TODO: Implementar upload para o Google Drive
    }
  })

  return (
    <div className="container mx-auto p-4">
      {/* Cabeçalho com Pesquisa */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Caderno Virtual</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Pesquisar notas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar com Disciplinas */}
        <div className="col-span-3 bg-card rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="h-5 w-5" />
            <h2 className="font-semibold">Disciplinas</h2>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start mb-2"
            onClick={() => setSelectedDisciplina('nova')}
          >
            + Nova Disciplina
          </Button>
          {/* Lista de disciplinas virá aqui */}
        </div>

        {/* Área Principal */}
        <div className="col-span-9 space-y-4">
          {/* Editor de Texto */}
          <div className="bg-card rounded-lg p-4">
            <ReactQuill
              theme="snow"
              value={editorContent}
              onChange={setEditorContent}
              className="bg-background min-h-[200px]"
            />
          </div>

          {/* Área de Upload */}
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:bg-accent/5 transition-colors cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-muted-foreground/75">
              Suporta PDF, imagens e vídeos
            </p>
          </div>

          {/* Lista de Arquivos */}
          <div className="bg-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5" />
              <h2 className="font-semibold">Arquivos Anexados</h2>
            </div>
            {/* Lista de arquivos virá aqui */}
          </div>
        </div>
      </div>
    </div>
  )
} 