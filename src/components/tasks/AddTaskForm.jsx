import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

export function AddTaskForm({ onAddTask }) {
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "média"
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    onAddTask({
      title: newTask.title.trim(),
      priority: newTask.priority,
      columnId: 'todo' // Todas as novas tarefas começam em "todo"
    })

    // Limpa o formulário
    setNewTask({
      title: "",
      priority: "média"
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Nova Tarefa</Label>
        <div className="flex gap-2">
          <Input
            id="title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Digite o título da tarefa"
          />
          <Select
            value={newTask.priority}
            onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="média">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Adicionar</Button>
        </div>
      </div>
    </form>
  )
} 