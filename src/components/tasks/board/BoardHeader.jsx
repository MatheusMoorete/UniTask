import { Search, X } from "lucide-react"
import { Input } from "../../ui/input"
import { useState } from "react"
import { Button } from "../../ui/button"

export function BoardHeader({ onSearch }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState("")

  const handleSearch = (value) => {
    setSearchText(value)
    onSearch(value)
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-background border-b">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ToDo List</h2>
          <p className="text-muted-foreground">
            Organize e gerencie suas tarefas
          </p>
        </div>
        <div className="flex items-center">
          {isSearchOpen ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-5">
              <Input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-[200px]"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchText("")
                  handleSearch("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}