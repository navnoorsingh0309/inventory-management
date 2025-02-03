import MyInventory from "@/components/myInventory";
import { User } from "@/models/models";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const page = async () => {
  const user = await currentUser();

  const curUser: User = {
    id: user?.id ?? "",
    name: user?.fullName ?? "Unknown User",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
  };
  return (
    <div className="p-6 rounded-lg shadow-lg border border-gray-200">
      <MyInventory user={curUser} />
    </div>
  );
};

export default page;
