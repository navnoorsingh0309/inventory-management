"use client";
import React, { useEffect, useState } from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { Button } from "./ui/button";
import { SignOutButton } from "@clerk/nextjs";
import Hamburger_Menu from "./ui/HamburgerMenu";
import { IconUserFilled } from "@tabler/icons-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Admin, SuperAdmin } from "@/models/models";

interface Props {
  email: string;
  firstName: string;
  superAdmin: string;
}

const NavBar: React.FC<Props> = ({ email, firstName, superAdmin }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  useEffect(() => {
    const getAdmins = async () => {
      try {
        const res = await fetch(`/api/admin`, {
          cache: "no-store",
        });
        const resJson = await res.json();
        const adminIdsJson = resJson.admins as Admin[];
        adminIdsJson.map((admin: Admin) => {
          if (email == admin.email) {
            setIsAdmin(true);
          }
        });
      } catch (err) {
        console.error("Error fetching Admins:", err);
      }

      try {
        const res = await fetch(`/api/co_admins`, {
          cache: "no-store",
        });
        const resJson = await res.json();
        const adminIdsJson = resJson.admins as SuperAdmin[];
        const adminIds = adminIdsJson.map((admin: SuperAdmin) => admin.email);
        adminIds.map((admin: string) => {
          if (email == admin) {
            setIsSuperAdmin(true);
          }
        })
      } catch (err) {
        console.error("Error fetching Admins:", err);
      }
      if (email === superAdmin) {
        setIsAdmin(true);
        setIsSuperAdmin(true);
      }
    };
    getAdmins();
  }, []);
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
            {email ? null : (
              <Button
                variant={"ghost"}
                asChild
                className="border-[color:var(--secondary-500)] border sm:border-0"
              >
                <Link href="/sign-in" className="text-lg font-bold">
                  Sign In
                </Link>
              </Button>
            )}

            {email ? null : (
              <span
                className="h-6 w-px bg-gray-200 hidden sm:flex"
                aria-hidden="true"
              />
            )}

            {email ? (
              <div className="flex h-full items-center gap-1 space-x-4">
                <div className="hidden md:flex h-full items-center justify-center space-x-1">
                  {(email === superAdmin) && (
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
                  {(!isAdmin && (email !== superAdmin)) && (
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
                  {(isAdmin || isSuperAdmin) && (
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
                        <span>Welcome, {firstName}!</span>
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
                <Hamburger_Menu email={email} superAdmin={superAdmin} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />
              </div>
            ) : (
              <Button className="hidden sm:flex" asChild>
                <Link href="/sign-up" className="text-lg font-bold">
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
