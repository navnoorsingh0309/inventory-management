import ProjectsSection from "@/components/ProjectsPage/projectsSection";
import { Admin, User } from "@/models/models";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const ProjectsPage = async () => {
  return (
    <ProjectsSection/>
  );
};

export default ProjectsPage;
