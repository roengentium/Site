"use client"

import { useState, useRef, useCallback, type ReactNode, type MouseEvent } from "react"

interface DraggableWindowProps {
  title: string
  children: ReactNode
  defaultPosition?: { x: number; y: number }
  defaultSize?: { width: number; height: number }
  isOpen: boolean
  onClose: () => void
  onFocus: () => void
  zIndex: number
  isMinimized?: boolean
}

export function DraggableWindow({
  title,
  children,
  defaultPosition = { x: 100, y: 100 },
  defaultSize = { width: 400, height: 300 },
  isOpen,
  onClose,
  onFocus,
  zIndex,
  isMinimized = false,
}: DraggableWindowProps) {
  const [position, setPosition] = useState(defaultPosition)
  const [size, setSize] = useState(defaultSize)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const preMaximizeState = useRef({ position: defaultPosition, size: defaultSize })

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return
    onFocus()
    setIsDragging(true)
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      setPosition({
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y),
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }, [position, onFocus])

  const handleMaximize = () => {
    if (isMaximized) {
      setPosition(preMaximizeState.current.position)
      setSize(preMaximizeState.current.size)
    } else {
      preMaximizeState.current = { position, size }
      setPosition({ x: 0, y: 0 })
      setSize({ width: window.innerWidth, height: window.innerHeight - 48 })
    }
    setIsMaximized(!isMaximized)
  }

  if (!isOpen || isMinimized) return null

  return (
    <div
      className="window glass active"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        minHeight: size.height,
        zIndex,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onClick={onFocus}
    >
      <div
        className="title-bar"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={() => {}} />
          <button aria-label="Maximize" onClick={handleMaximize} />
          <button aria-label="Close" onClick={onClose} />
        </div>
      </div>
      <div className="window-body" style={{ padding: "8px", maxHeight: size.height - 80, overflow: "auto" }}>
        {children}
      </div>
    </div>
  )
}
