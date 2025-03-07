"use client";
import React from "react";
import MaxWidthWrapper from "../ui/MaxWidthWrapper";
import Link from "next/link";
import { Button } from "../ui/button";
import { SignOutButton } from "@clerk/nextjs";
import Hamburger_Menu from "./HamburgerMenu";
import { IconUserFilled } from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";

const NavBar = () => {
  const user = useSelector((state: RootState) => state.UserData.user);
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-400 backdrop-blur-lg translate-all">
      <MaxWidthWrapper>
        <div className="flex justify-between pl-2 pr-2 items-center h-full w-full">
          <div className="flex h-full items-center gap-2">
            <Link href="/">
              <img
                src="/bost.png"
                className="lg:h-10 lg:w-10 h-8 w-8 rounded-full"
              />
            </Link>
            <Link href="/" className="font-bold text-2xl">
              Inventory Management
            </Link>
          </div>

          <div className="items-center space-x-4 sm:flex">
            {user.id!=="" ? null : (
              <Button
                variant={"ghost"}
                asChild
                className="border-[color:var(--secondary-500)] border sm:border-0"
              >
                <Link href="/auth?v=signin" className="text-lg font-bold">
                  Sign In
                </Link>
              </Button>
            )}

            {user.id!=="" ? null : (
              <span
                className="h-6 w-px bg-gray-200 hidden sm:flex"
                aria-hidden="true"
              />
            )}

            {user.id!=="" ? (
              <div className="flex h-full items-center gap-1 space-x-4">
                <div className="hidden md:flex h-full items-center justify-center space-x-1">
                  {(user.role === 3) && (
                    <Button
                      variant={"ghost"}
                      asChild
                      className={
                        "border-[color:var(--secondary-500)] border sm:border-0"
                      }
                    >
                      <Link href="/admin" className="text-lg font-bold">
                        Admin Portal
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant={"ghost"}
                    asChild
                    className={
                      "border-[color:var(--secondary-500)] border sm:border-0"
                    }
                  >
                    <Link href="/inventory" className="text-lg font-bold">
                      Inventory
                    </Link>
                  </Button>
                  <Button
                    variant={"ghost"}
                    asChild
                    className={
                      "border-[color:var(--secondary-500)] border sm:border-0"
                    }
                  >
                    <Link href="/projects" className="text-lg font-bold">
                      Projects
                    </Link>
                  </Button>
                  {(user.role === 0 || user.role === 2) && (
                    <Button
                      variant={"ghost"}
                      asChild
                      className={
                        "border-[color:var(--secondary-500)] border sm:border-0"
                      }
                    >
                      <Link href="/my-inventory" className="text-lg font-bold">
                        My Inventory
                      </Link>
                    </Button>
                  )}
                  {user.role!==0 && (
                    <Button
                      variant={"ghost"}
                      asChild
                      className={
                        "border-[color:var(--secondary-500)] border sm:border-0"
                      }
                    >
                      <Link href="/requests" className="text-lg font-bold">
                        Requests
                      </Link>
                    </Button>
                  )}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="rounded-full p-0 px-3 bg-gray-700 hover:bg-gray-600 text-white">
                        <IconUserFilled />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-white border border-gray-300 rounded-lg shadow-md p-4">
                      <h1 className="text-lg font-semibold text-gray-800 mb-4 items-center space-x-2">
                        <span>Welcome, {user.firstName}!</span>
                        <span className="animate-wave">👋</span>
                      </h1>
                      <SignOutButton>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md">
                          Sign Out
                        </Button>
                      </SignOutButton>
                    </PopoverContent>
                  </Popover>
                </div>
                <Hamburger_Menu/>
              </div>
            ) : (
              <Button className="hidden sm:flex" asChild>
                <Link href="/auth?v=signup" className="text-lg font-bold">
                  Let&apos;s get started
                </Link>
              </Button>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default NavBar;
