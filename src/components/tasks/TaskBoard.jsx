import { DndContext, DragOverlay } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { motion, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { useGesture } from "@use-gesture/react"
import { SortableColumn } from "./SortableColumn"
import { AddColumnButton } from "./AddColumnButton"
import { DragPreview } from "./DragPreview"
import { cn } from "../../lib/utils"

export function TaskBoard({
  columns,
  filteredTasks,
  draggedColumnId,
  activeId,
  onDragStart,
  onDragEnd,
  sensors,
  collisionDetection,
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
  onTaskEdit
}) {
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isGestureDragging, setIsGestureDragging] = useState(false)
  const [isGestureEnabled, setIsGestureEnabled] = useState(true)
  
  // Limpa todos os estados de drag
  const cleanupDragStates = () => {
    setIsDragging(false)
    setIsGestureDragging(false)
    document.body.style.userSelect = ''
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab'
    }
  }

  // Modificar o handler do DndContext
  const handleDragEnd = async (event) => {
    cleanupDragStates()
    setIsGestureEnabled(false)
    await onDragEnd(event)
    
    setTimeout(() => {
      setIsGestureEnabled(true)
    }, 500)
  }

  // Adicionar um handler para o DragStart
  const handleDragStart = (event) => {
    cleanupDragStates()
    onDragStart(event)
  }

  const bind = useGesture({
    onDragStart: ({ event, down }) => {
      if (activeId || !down || !isGestureEnabled) return

      document.body.style.userSelect = 'none'
      setIsGestureDragging(true)
      setIsDragging(true)
    },
    onDragEnd: () => {
      cleanupDragStates()
    },
    onDrag: ({ delta: [dx], down, event }) => {
      if (!containerRef.current || !down || activeId || !isGestureEnabled) return
      containerRef.current.scrollLeft -= dx
    },
  }, {
    drag: {
      filterTaps: true,
      threshold: 1,
      enabled: !activeId && isGestureEnabled
    },
  })

  // Cleanup em caso de unmount
  useEffect(() => {
    return () => {
      cleanupDragStates()
    }
  }, [])

  // Cleanup quando activeId muda
  useEffect(() => {
    if (!activeId) {
      cleanupDragStates()
    }
  }, [activeId])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-x-auto",
        isGestureDragging && !activeId && isGestureEnabled ? 'cursor-grabbing select-none' : 'cursor-grab'
      )}
      {...bind()}
      style={{
        touchAction: (activeId || !isGestureEnabled) ? 'auto' : 'none',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
      css={{
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }}
    >
      <div className="px-6 py-2 min-w-max">
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <motion.div 
            className="flex gap-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              <SortableContext
                key="columns-context"
                items={columns.map(col => col.id)}
                strategy={horizontalListSortingStrategy}
              >
                {columns.map((column) => (
                  <SortableColumn
                    key={column.id}
                    column={column}
                    onEdit={(columnId, title) => {
                      if (columnId && title) {
                        onColumnUpdate(columnId, { title })
                      }
                    }}
                    onDelete={onColumnDelete}
                    tasks={filteredTasks.filter(task => task.columnId === column.id)}
                    onTaskEdit={(task, initialData) => {
                      if (task) {
                        setEditingTask(task)
                        setNewTask({
                          title: task.title || '',
                          description: task.description || '',
                          moreInfo: task.moreInfo || '',
                          tags: task.tags || [],
                          columnId: task.columnId
                        })
                      } else {
                        setEditingTask(null)
                        setNewTask(prev => ({ ...prev, ...initialData }))
                      }
                      setIsDialogOpen(true)
                    }}
                    onTaskDelete={onTaskDelete}
                    onSelect={() => onColumnSelect(column.id)}
                    isActive={column.id === activeColumnId}
                  />
                ))}
              </SortableContext>

              <motion.div key="add-column-button" layout>
                <AddColumnButton
                  isOpen={isColumnDialogOpen}
                  onOpenChange={setIsColumnDialogOpen}
                  title={newColumnTitle}
                  onTitleChange={setNewColumnTitle}
                  onAdd={onColumnAdd}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <DragOverlay>
            {draggedColumnId ? (
              <DragPreview 
                item={columns.find(c => c.id === draggedColumnId)}
                type="column"
              />
            ) : activeId ? (
              <DragPreview 
                item={filteredTasks.find(t => t.id === activeId)}
                type="task"
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
} 