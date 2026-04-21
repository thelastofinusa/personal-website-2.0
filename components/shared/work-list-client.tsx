"use client"

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import React from "react"
import { CSS } from "@dnd-kit/utilities"
import ReactMarkdown from "react-markdown"
import { RxDragHandleDots2 } from "react-icons/rx"
import { LuListTree } from "react-icons/lu"
import { IoGridOutline } from "react-icons/io5"
import { LuBookMarked } from "react-icons/lu"
import { LayoutGroup, motion } from "framer-motion"

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { stripMarkdown } from "@/lib/utils"
import { siteConfig } from "@/config/site.config"
import { ProjectType } from "./work-list"

type Props = {
  title?: string
  description?: string
  featured?: boolean
  projects: ProjectType[]
}

export const WorkListClient = ({
  title,
  description,
  projects,
  featured,
}: Props) => {
  const sensors = useSensors(useSensor(PointerSensor))

  /**
   * Local state for drag ordering
   */
  const [items, setItems] = React.useState(projects)

  /**
   * ✅ FIX: Sync with Sanity Live updates
   * Preserves order where possible instead of resetting
   */
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(projects)
  }, [projects])

  /**
   * Drag handler
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const newItems = arrayMove(
      items,
      items.findIndex((i) => i.slug === active.id),
      items.findIndex((i) => i.slug === over.id)
    )

    // ✅ Optimistic UI

    setItems(newItems)

    try {
      await fetch("/api/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(
          newItems.map((item, index) => ({
            _id: item._id,
            order: index,
          }))
        ),
      })
    } catch (err) {
      console.error("Failed to persist order", err)
    }
  }

  return (
    <div className="space-y-4">
      {title && <p className="font-semibold">{title}</p>}
      {description && <p>{description}</p>}

      {featured && (
        <ul className="list-disc space-y-1 pl-5">
          {projects.map((project) => (
            <li key={project.name} className="pl-1">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={project.url}
                className="font-semibold text-primary underline underline-offset-4"
              >
                {project.name}
              </a>{" "}
              -{" "}
              <ReactMarkdown
                components={{
                  p: ({ children }) => <span>{children}</span>,
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  code: ({ children }) => (
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      {children}
                    </code>
                  ),
                }}
              >
                {project.description}
              </ReactMarkdown>
            </li>
          ))}
        </ul>
      )}

      {!featured && (
        <Tabs key={featured ? "featured" : "all"} defaultValue="grid">
          <TabsList className="ml-auto">
            <TabsTrigger value="list">
              <LuListTree className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="grid">
              <IoGridOutline className="size-4" />
            </TabsTrigger>
          </TabsList>

          {/* LIST VIEW */}
          <TabsContent value="list">
            <ul className="list-disc space-y-1 pl-5">
              {projects.map((project) => (
                <li key={project.name} className="pl-1">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={project.url}
                    className="font-semibold text-primary underline underline-offset-4"
                  >
                    {project.name}
                  </a>{" "}
                  -{" "}
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <span>{children}</span>,
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-muted px-1 py-0.5 text-xs">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {project.description}
                  </ReactMarkdown>
                </li>
              ))}
            </ul>
          </TabsContent>

          {/* GRID VIEW */}
          <TabsContent value="grid">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.slug)}
                strategy={rectSortingStrategy}
              >
                <motion.div layout className="grid gap-4 md:grid-cols-2">
                  {items.map((project) => (
                    <SortableCard key={project.slug} project={project} />
                  ))}
                </motion.div>
              </SortableContext>
            </DndContext>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export const SortableCard = ({ project }: { project: ProjectType }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.slug })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="relative h-full"
    >
      <motion.div
        animate={{
          scale: isDragging ? 1.05 : 1,
          opacity: isDragging ? 0.6 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="h-full space-y-3 rounded-xl border bg-background p-4 squircle"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <LuBookMarked className="size-4 text-muted-foreground" />

            <Tooltip>
              <TooltipTrigger>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={project.url}
                  className="font-semibold text-primary hover:underline"
                >
                  {siteConfig.username}/{project.slug}
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{project.name}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Drag Handle */}
          <RxDragHandleDots2
            {...attributes}
            {...listeners}
            className="size-4 cursor-grab active:cursor-grabbing"
          />
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground">
            {stripMarkdown(project.description)}
          </p>
        )}
      </motion.div>
    </div>
  )
}
