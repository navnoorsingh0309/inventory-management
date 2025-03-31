"use client"

import { useState } from "react"
import { SignOutButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { LogOut, Package, FolderOpen, ShoppingBag, FileText, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

const HamburgerMenu = () => {
  const [showMenu, setShowMenu] = useState(false)
  const user = useSelector((state: RootState) => state.UserData.user)

  const handleMenuClick = () => {
    setShowMenu(!showMenu)
  }

  return (
    <div className="md:hidden relative z-50">
      {/* Hamburger Button */}
      <button
        onClick={handleMenuClick}
        className="flex flex-col justify-center items-center w-10 h-10 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors"
        aria-label="Toggle menu"
        aria-expanded={showMenu}
      >
        <div className="relative w-6 h-5">
          <span
            className={`absolute h-0.5 w-6 bg-primary rounded-full transform transition-all duration-300 ${showMenu ? "rotate-45 top-2" : "top-0"}`}
          ></span>
          <span
            className={`absolute h-0.5 w-6 bg-primary rounded-full top-2 transition-all duration-200 ${showMenu ? "opacity-0" : "opacity-100"}`}
          ></span>
          <span
            className={`absolute h-0.5 w-6 bg-primary rounded-full transform transition-all duration-300 ${showMenu ? "-rotate-45 top-2" : "top-4"}`}
          ></span>
        </div>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed h-screen inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowMenu(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-screen w-64 bg-white dark:bg-gray-900 shadow-xl"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b dark:border-gray-800">
                  <h2 className="font-bold text-lg">Menu</h2>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                  <ul className="space-y-1 px-3">
                    {user.role === 3 && (
                      <li>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-colors text-gray-800 dark:text-gray-200 font-medium"
                        >
                          <ShieldCheck className="h-5 w-5 text-primary" />
                          Admin Portal
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        href="/inventory"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-colors text-gray-800 dark:text-gray-200 font-medium"
                      >
                        <Package className="h-5 w-5 text-primary" />
                        Inventory
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/projects"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-colors text-gray-800 dark:text-gray-200 font-medium"
                      >
                        <FolderOpen className="h-5 w-5 text-primary" />
                        Projects
                      </Link>
                    </li>
                    {(user.role === 0 || user.role === 2) && (
                      <li>
                        <Link
                          href="/my-inventory"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-colors text-gray-800 dark:text-gray-200 font-medium"
                        >
                          <ShoppingBag className="h-5 w-5 text-primary" />
                          My Inventory
                        </Link>
                      </li>
                    )}
                    {user.role !== 0 && (
                      <li>
                        <Link
                          href="/requests"
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/5 transition-colors text-gray-800 dark:text-gray-200 font-medium"
                        >
                          <FileText className="h-5 w-5 text-primary" />
                          Requests
                        </Link>
                      </li>
                    )}
                  </ul>
                </nav>

                <div className="p-4 border-t dark:border-gray-800">
                  <SignOutButton>
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </SignOutButton>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HamburgerMenu

