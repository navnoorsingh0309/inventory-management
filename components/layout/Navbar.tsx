"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { SignOutButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Package, FolderOpen, ShoppingBag, FileText, ShieldCheck, LogOut, User } from 'lucide-react';
import MaxWidthWrapper from "../ui/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RootState } from "@/lib/store";
import HamburgerMenu from "./HamburgerMenu";
import { User as UserSchema } from "@/models/models";

const NavBar = () => {
  const user = useSelector((state: RootState) => state.UserData.user);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`sticky h-16 inset-x-0 top-0 z-30 w-full border-b backdrop-blur-lg transition-all duration-300 ${
        scrolled 
          ? "border-gray-200 bg-white/75 dark:bg-gray-900/75 dark:border-gray-800" 
          : "border-transparent bg-white/50 dark:bg-gray-900/50"
      }`}
    >
      <MaxWidthWrapper>
        <div className="flex justify-between items-center h-full w-full">
          <div className="flex h-full items-center gap-3">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <motion.img
                src="/bost.png"
                className="h-9 w-9 rounded-full shadow-sm"
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hidden sm:inline-block">
                Inventory Management
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user.id === "" ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-gray-700 dark:text-gray-300 hover:text-primary"
                >
                  <Link href="/auth?v=signin">Sign In</Link>
                </Button>

                <Button asChild className="hidden sm:flex shadow-sm">
                  <Link href="/auth?v=signup" className="font-medium">
                    Let&apos;s get started
                  </Link>
                </Button>
              </>
            ) : (
              <div className="flex h-full items-center gap-2">
                <div className="hidden md:flex h-full items-center space-x-1">
                  {user.role === 3 && (
                    <NavItem href="/admin" icon={<ShieldCheck className="h-4 w-4" />}>
                      Admin Portal
                    </NavItem>
                  )}
                  
                  <NavItem href="/inventory" icon={<Package className="h-4 w-4" />}>
                    Inventory
                  </NavItem>
                  
                  <NavItem href="/projects" icon={<FolderOpen className="h-4 w-4" />}>
                    Projects
                  </NavItem>
                  
                  {(user.role === 0 || user.role === 2) && (
                    <NavItem href="/my-inventory" icon={<ShoppingBag className="h-4 w-4" />}>
                      My Inventory
                    </NavItem>
                  )}
                  
                  {user.role !== 0 && (
                    <NavItem href="/requests" icon={<FileText className="h-4 w-4" />}>
                      Requests
                    </NavItem>
                  )}

                  <UserMenu user={user} />
                </div>
                
                <HamburgerMenu />
              </div>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </motion.nav>
  );
};

interface NavItemProps {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ href, children, icon }) => (
  <Button
    variant="ghost"
    size="sm"
    asChild
    className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5"
  >
    <Link href={href} className="font-medium">
      {icon}
      {children}
    </Link>
  </Button>
);

interface UserProps {
  user: UserSchema;
}

const UserMenu: React.FC<UserProps> = ({ user }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button 
        variant="outline" 
        size="sm"
        className="rounded-full h-9 w-9 p-0 border-gray-200 bg-white/80 hover:bg-gray-100"
      >
        <User className="h-5 w-5 text-gray-700" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium">Welcome, {user.firstName}!</p>
          <p className="text-xs text-muted-foreground">
            {user.email || "User"}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/profile" className="cursor-pointer flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-red-600 focus:text-red-600">
        <SignOutButton>
          <div className="flex items-center gap-2 cursor-pointer w-full">
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </div>
        </SignOutButton>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default NavBar;
