"use client"

import Image from "next/image"

interface StartMenuProps {
  isOpen: boolean
  onClose: () => void
  onOpenApp: (appId: string) => void
}

const apps = [
  { id: "array", name: "//array//", icon: "/icons/home.png" },
  { id: "browser", name: "Internet Explorer", icon: "/icons/ie.png" },
  { id: "calculator", name: "Calculator", icon: "/icons/calculator.png" },
  { id: "minesweeper", name: "Minesweeper", icon: "/icons/minesweeper.png" },
  { id: "notepad", name: "Notepad", icon: "/icons/notepad.png" },
  { id: "projects", name: "Projects", icon: "/icons/projects.png" },
  { id: "languages", name: "Languages", icon: "/icons/languages.png" },
]

export function StartMenu({ isOpen, onClose, onOpenApp }: StartMenuProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="start-menu-backdrop" onClick={onClose} />
      <div className="start-menu">
        <div className="start-menu-header">
          <div className="user-avatar" />
          <span className="user-name">User</span>
        </div>
        <div className="start-menu-content">
          <div className="start-menu-left">
            {apps.map((app) => (
              <button
                key={app.id}
                className="start-menu-item"
                onClick={() => {
                  onOpenApp(app.id)
                  onClose()
                }}
              >
                <Image src={app.icon} alt="" width={32} height={32} unoptimized />
                <span>{app.name}</span>
              </button>
            ))}
          </div>
          <div className="start-menu-right">
            <button className="start-menu-item-small">Documents</button>
            <button className="start-menu-item-small">Pictures</button>
            <button className="start-menu-item-small">Music</button>
            <button className="start-menu-item-small">Computer</button>
            <button className="start-menu-item-small">Control Panel</button>
          </div>
        </div>
        <div className="start-menu-footer">
          <button className="shutdown-button">Shut down</button>
        </div>
      </div>
    </>
  )
}
