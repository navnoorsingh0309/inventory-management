"use client";
import React, { useEffect, useState } from "react";
import { Admin } from "@/models/models";
import { Project } from "@/models/models";
import AddProjectButton from "./addProjectButton";
import { IconCircleDashedCheck, IconTrash } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useToast } from "@/hooks/use-toast";

interface props {
  category: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const ProjectsSection: React.FC<props> = ({
  category,
  isAdmin,
  isSuperAdmin,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Fetch categories
        const res = await fetch("/api/admin");
        const data = await res.json();
        const AdminsData = data.admins;
        const newCategories = [
          "BoST",
          ...AdminsData.map((admin: Admin) => admin.category),
        ];

        // Fetch inventory **after** categories are set
        const projectsData = await Promise.all(
          newCategories.map(async (category) => {
            const response = await fetch(`/api/projects?pn=${category}`);
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data.projects;
          })
        );

        setProjects(projectsData.flat());
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Deleting Project
  const deleteProject = async (project: Project) => {
    try {
      await fetch("/api/projects", {
        method: "DELETE",
        body: JSON.stringify({
          category: project.category,
          _id: project._id,
        }),
        headers: {
          "Content-type": "application/json",
        },
      });
      toast({ title: "Project Deleted!" });
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Marking Project Complete
  // Deleting Project
  const completedProject = async (project: Project) => {
    try {
      await fetch("/api/projects", {
        method: "PUT",
        body: JSON.stringify({
          category: project.category,
          _id: project._id,
        }),
        headers: {
          "Content-type": "application/json",
        },
      });
      toast({ title: "Project Marked as completed!" });
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {(isAdmin || isSuperAdmin) && <AddProjectButton category={category} isSuperAdmin={isSuperAdmin} />}
      {loading ? (
        <div className="w-full flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <div className="w-full mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length > 0 && 
            projects.map((project: Project) => (
            <div
              key={project._id}
              className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl overflow-hidden transition transform hover:scale-105 hover:shadow-2xl"
            >
              <img
                src={`https://utfs.io/f/${project.image}`}
                alt={project.title}
                className="w-full h-52 object-cover rounded-t-xl"
              />
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center justify-between">
                  {project.title}
                  {(isAdmin || isSuperAdmin) && (
                    <div className="space-x-3 flex items-center">
                      {project.completed === false && (
                        <button
                          className="text-blue-600 hover:text-blue-800 transition"
                          onClick={() => completedProject(project)}
                          title="Mark as Complete"
                        >
                          <IconCircleDashedCheck size={20} />
                        </button>
                      )}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="text-red-500 hover:text-red-700 transition"
                            title="Delete Project"
                          >
                            <IconTrash size={20} />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold">
                                Delete this Project
                              </h4>
                              <p className="text-sm text-gray-600">
                                Are you sure you want to delete this Project?
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => deleteProject(project)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Yes
                              </Button>
                              <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                                No
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Lead: {project.leadName} (
                  <a
                    href={`mailto:${project.leadEmail}`}
                    className="text-blue-500"
                  >
                    {project.leadEmail}
                  </a>
                  )
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Start Date: {new Date(project.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  End Date:{" "}
                  {project.completed
                    ? new Date(project.endDate).toLocaleDateString()
                    : "Ongoing"}
                </p>
                <div
                  className={`mt-6 px-4 py-2 rounded-full text-center text-sm font-medium transition ${
                    project.completed
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {project.completed ? "Completed" : "Ongoing"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
