import { TaskBoard } from '../components/tasks/board'
import { useTaskBoard } from '../contexts/BoardContext'
import { BoardHeader } from '../components/tasks/board/BoardHeader'

export default function TaskPage() {
  const {
    columns,
    filteredTasks,
    draggedColumnId,
    activeId,
    onDragStart,
    onDragEnd,
    sensors,
    onColumnUpdate,
    onColumnDelete,
    isColumnDialogOpen,
    setIsColumnDialogOpen,
    newColumnTitle,
    setNewColumnTitle,
    onColumnAdd,
    onColumnSelect,
    activeColumnId,
    setEditingTask,
    setIsDialogOpen,
    setNewTask,
    onTaskDelete,
    onTaskEdit,
    setSearchQuery
  } = useTaskBoard()

  return (
    <div className="h-full flex flex-col">
      <BoardHeader onSearch={setSearchQuery} />
      <div className="flex-1 relative">
        <TaskBoard
          columns={columns}
          filteredTasks={filteredTasks}
          draggedColumnId={draggedColumnId}
          activeId={activeId}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          sensors={sensors}
          onColumnUpdate={onColumnUpdate}
          onColumnDelete={onColumnDelete}
          isColumnDialogOpen={isColumnDialogOpen}
          setIsColumnDialogOpen={setIsColumnDialogOpen}
          newColumnTitle={newColumnTitle}
          setNewColumnTitle={setNewColumnTitle}
          onColumnAdd={onColumnAdd}
          onColumnSelect={onColumnSelect}
          activeColumnId={activeColumnId}
          setEditingTask={setEditingTask}
          setIsDialogOpen={setIsDialogOpen}
          setNewTask={setNewTask}
          onTaskDelete={onTaskDelete}
          onTaskEdit={onTaskEdit}
        />
      </div>
    </div>
  )
} 