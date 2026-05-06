"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import clsx from "clsx"
import Button from "../design-system/button/button"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      <Button
        variant="filled"
        size="sm"
        iconOnly
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setIsOpen((prev) => !prev)}
        className={clsx(
          "relative z-20 shadow-lg",
          isOpen && "rounded-b-none"
        )}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      <div
        className={clsx(
          "overflow-hidden rounded-2xl rounded-tr-none bg-white shadow-xl transition-all duration-300 ease-in-out",
          "origin-top-right",
          isOpen
            ? "mt-0 max-h-80 w-64 opacity-100"
            : "pointer-events-none -mt-2 max-h-0 w-64 opacity-0"
        )}
      >
        <nav className="flex flex-col p-4 pt-5">
          <a
            href="#about"
            className="rounded-lg px-4 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
          >
            À propos
          </a>
          <a
            href="#services"
            className="rounded-lg px-4 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
          >
            Services
          </a>
          <a
            href="#contact"
            className="rounded-lg px-4 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
          >
            Contact
          </a>
        </nav>
      </div>
    </div>
  )
}