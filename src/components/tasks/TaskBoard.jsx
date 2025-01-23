import { DndContext, DragOverlay } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { motion, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { useGesture } from "@use-gesture/react"
import { SortableColumn } from "./SortableColumn"
import { AddColumnButton } from "./AddColumnButton"
import { DragPreview } from "./DragPreview"

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
  
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventScroll = (e) => {
      if (isDragging) {
        e.preventDefault()
      }
    }

    container.addEventListener('touchmove', preventScroll, { passive: false })
    return () => {
      container.removeEventListener('touchmove', preventScroll)
    }
  }, [isDragging])

  const bind = useGesture({
    onDragStart: () => {
      if (document.body.style) {
        document.body.style.userSelect = 'none'
        setIsDragging(true)
      }
    },
    onDragEnd: () => {
      if (document.body.style) {
        document.body.style.userSelect = ''
        setIsDragging(false)
      }
    },
    onDrag: ({ delta: [dx], down, event }) => {
      if (!containerRef.current || !down) return
      containerRef.current.scrollLeft -= dx
    },
  }, {
    drag: {
      filterTaps: true,
      threshold: 1,
      pointer: {
        touch: true,
      },
    },
  })

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-x-auto ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      {...bind()}
      style={{
        touchAction: 'none',
        scrollbarWidth: 'none',  // Firefox
        msOverflowStyle: 'none'  // IE/Edge
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
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
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