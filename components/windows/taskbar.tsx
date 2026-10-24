"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface TaskbarProps {
  openWindows: { id: string; title: string; icon: string }[]
  onWindowClick: (id: string) => void
  onStartClick: () => void
  isStartOpen: boolean
}

export function Taskbar({ openWindows, onWindowClick, onStartClick, isStartOpen }: TaskbarProps) {
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }))
      setDate(now.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="taskbar">
      <button
        className={`start-button ${isStartOpen ? "active" : ""}`}
        onClick={onStartClick}
      >
        <div className="start-orb" />
      </button>

      <div className="taskbar-programs">
        {openWindows.map((window) => (
          <button
            key={window.id}
            className="taskbar-item"
            onClick={() => onWindowClick(window.id)}
          >
            <Image src={window.icon} alt="" width={16} height={16} unoptimized />
            <span>{window.title}</span>
          </button>
        ))}
      </div>

      <div className="taskbar-tray">
        <div className="tray-time">
          <span>{time}</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  )
}
