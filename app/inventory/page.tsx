import AddInventoryButton from "@/components/addInventoryButton";
import InventoryTable from "@/components/InventoryTable";
import { Admin, User } from "@/models/models";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const InventoryPage = async () => {
  const user = await currentUser();

  if (!user) {
    return <p>User not found.</p>;
  }

  const curUser: User = {
    id: user.id,
    name: user.fullName || "Unknown User",
    email: user.primaryEmailAddress?.emailAddress || "",
  };

  let isAdmin = false,
    isSuperAdmin = false,
    category = "";

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin`, {
      cache: "no-store",
    });
    const resJson = await res.json();
    const adminIdsJson = resJson.admins as Admin[];
    adminIdsJson.map((admin: Admin) => {
      if (curUser.email == admin.email) {
        isAdmin = true;
        category = admin.category;
      }
    });
  } catch (err) {
    console.error("Error fetching Admins:", err);
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/co_admins`,
      {
        cache: "no-store",
      }
    );
    const resJson = await res.json();
    const adminIdsJson = resJson.admins as Admin[];
    const adminIds = adminIdsJson.map((admin: Admin) => admin.email);
    isSuperAdmin = adminIds.includes(curUser.email);
  } catch (err) {
    console.error("Error fetching Admins:", err);
  }
  if (curUser.email === process.env.SUPER_ADMIN) {
    isSuperAdmin = true;
    category = "BoST";
  }

  return (
    <div className="mt-10 mx-5 rounded-xl p-3 shadow-lg border border-gray-200 relative mb-5">
      {(isAdmin || isSuperAdmin) && (
        <AddInventoryButton
          category={category}
          isSuperAdmin={isSuperAdmin}
        />
      )}
      <InventoryTable user={curUser} category={category} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />
    </div>
  );
};

export default InventoryPage;
