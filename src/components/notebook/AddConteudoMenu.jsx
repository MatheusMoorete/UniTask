import { FileText, Upload } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { Plus } from "lucide-react"

export function AddConteudoMenu({ onNewText, onNewFile, disabled }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          className="bg-[#003366] hover:bg-[#002347] text-white"
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Conteúdo
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onNewText} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          Novo Texto
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNewFile} className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          Anexar Arquivo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 