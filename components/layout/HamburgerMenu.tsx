import React, { useState } from "react";
import "./menu.css";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";

const Hamburger_Menu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const user = useSelector((state: RootState) => state.UserData.user);
  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };
  return (
    <div className="md:hidden">
      <label className="flex flex-col w-[30px] cursor-pointer">
        <input type="checkbox" id="check" onChange={handleMenuClick} />
        <span></span>
        <span></span>
        <span></span>
      </label>

      {showMenu && (
        <div className="fixed animate-in slide-in-from-top-5 slide-out-to-top-5 z-0 w-6/12 right-0 h-full pr-2">
          <ul className="absolute text-right text-xl font-black bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-10 pb-8">
            {user.role === 3 && (
              <li>
                <a href="/admin">Admin Portal</a>
              </li>
            )}
            <li>
              <a href="/inventory">Inventory</a>
            </li>
            <li>
              <a href="/inventory">Projects</a>
            </li>
            {(user.role === 0 || user.role === 2) && (
              <li>
                <a href="/my-inventory">My Inventory</a>
              </li>
            )}
            {user.role!==0 && (
              <li>
                <a href="/requests">Requests</a>
              </li>
            )}
            <SignOutButton>
              <Button>Signout</Button>
            </SignOutButton>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Hamburger_Menu;
