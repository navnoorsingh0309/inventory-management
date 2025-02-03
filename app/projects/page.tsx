import ProjectsSection from "@/components/projectsSection";
import { Admin, User } from "@/models/models";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const ProjectsPage = async () => {
  const user = await currentUser();

  const curUser: User = {
    id: user?.id ?? "",
    name: user?.fullName ?? "Unknown User",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
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
    <ProjectsSection
      category={category}
      isAdmin={isAdmin}
      isSuperAdmin={isSuperAdmin}
    />
  );
};

export default ProjectsPage;
