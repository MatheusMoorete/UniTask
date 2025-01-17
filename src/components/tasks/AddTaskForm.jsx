import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

const AddTaskForm = ({ onAddTask }) => {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("")
  const [subject, setSubject] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !priority || !subject) return

    onAddTask({
      id: Date.now(),
      title: title.trim(),
      priority,
      subject,
      completed: false
    })

    setTitle("")
    setPriority("")
    setSubject("")
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Input
              placeholder="Digite o título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex gap-2">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="média">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Disciplina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cálculo III">Cálculo III</SelectItem>
                  <SelectItem value="Física II">Física II</SelectItem>
                  <SelectItem value="Programação">Programação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Adicionar Tarefa
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddTaskForm 