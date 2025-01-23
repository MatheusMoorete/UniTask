import { Loader2 } from "lucide-react"

export function TaskListState({ user, loading, error }) {
  if (!user) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="text-muted-foreground">Faça login para ver suas tarefas</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return null
} 