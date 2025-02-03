import React, { useState } from "react";
import "./menu.css";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "./button";

interface Props {
  email: string;
  superAdmin: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const Hamburger_Menu: React.FC<Props> = ({
  email,
  superAdmin,
  isAdmin,
  isSuperAdmin,
}) => {
  const [showMenu, setShowMenu] = useState(false);
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
            {email === superAdmin && (
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
            {!isAdmin && (
              <li>
                <a href="/my-inventory">My Inventory</a>
              </li>
            )}
            {(isAdmin || isSuperAdmin) && (
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
