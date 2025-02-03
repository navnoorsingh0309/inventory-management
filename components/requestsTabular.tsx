"use client";

import React, { useEffect, useState } from "react";
import { Tabs } from "@chakra-ui/react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { IconInfoCircle } from "@tabler/icons-react";
import { format } from "date-fns";
import { Component, Project, Request } from "@/models/models";
import { useToast } from "@/hooks/use-toast";
import MarkAsReturnButton from "./markAsReturnButton";

interface Props {
  category: string;
}

const RequestsTabular: React.FC<Props> = ({
  category,
}) => {
  const [getRequests, setGetRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = React.useState([]);
  const { toast } = useToast();

  // getting Requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/request?pn=${category}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Filter and set specific requests
        setPendingRequests(
          data.requests.filter((req: Request) => req.status === "Pending")
        );
        setApprovedRequests(
          data.requests.filter((req: Request) => req.status === "Approved")
        );
        setRejectedRequests(
          data.requests.filter((req: Request) => req.status === "Rejected")
        );
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [getRequests]);

  // Function to update request status
  const updateRequestStatus = async (req: Request, status: string) => {
    let alreadyBeingUsed = 0;
    if (status === "Approved") {
      // Checking Stock
      try {
        const response = await fetch(`/api/inventory?pn=${category}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Find the component in the inventory
        const component = data.inventory.find(
          (item: Component) => item._id === req.inventoryId
        );

        // Check stock availability
        if (component.inStock - component.inUse >= req.quantity) {
          alreadyBeingUsed = component.inUse;
        } else {
          // Insufficient stock
          toast({
            title: "Insufficient stock",
            description: `Available: ${component.inStock - component.inUse}
            \nRequired: ${req.quantity}.`,
          });
          return;
        }
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Failed to load inventory.");
      } finally {
        setLoading(false);
      }

      // Updating Stock
      try {
        const response = await fetch(`/api/inventory`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: category,
            task: 0,
            _id: req.inventoryId,
            project: false,
            email: req.email,
            name: req.name,
            phone: req.phone,
            reqId: req._id,
            reqQuantity: req.quantity,
            quantity: alreadyBeingUsed + req.quantity,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to update status.");
        }
      } catch (err) {
        console.error("Error updating status:", err);
        alert(err);
      }
    }

    // Updating User-Data
    try {
      await fetch(`/api/user_data?pn=${req.userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: 0,
          reqId: req._id,
          status: status,
        }),
      });
    } catch (err) {
      console.error("Error updating user-data:", err);
      alert(err);
    }

    // Updating status
    try {
      const response = await fetch(`/api/request`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: req._id,
          task: 0,
          status: status,
          category: category,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update status.");
      }
      toast({
        title: "Done!!",
      });
      gettingRequests();
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err);
    }
  };

  // Getting Projects list
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects?pn=${category}`);
        const data = await response.json();
        const projectTitles = data.projects.map(
          (project: Project) => project.title
        );
        setProjects(projectTitles);
      } catch (err) {
        console.error("Error fetching projects:", err);
        alert(err);
      }
    };
    fetchProjects();
  }, []);

  // Re-getting requests
  const gettingRequests = () => {
    setGetRequests(!getRequests);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Tabs.Root defaultValue="pending" className="w-full">
      <Tabs.List className="flex justify-around bg-gray-100/40 backdrop-blur-lg rounded-md p-2">
        <Tabs.Trigger
          value="pending"
          className="px-6 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
        >
          Pending
        </Tabs.Trigger>
        <Tabs.Trigger
          value="approved"
          className="px-6 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
        >
          Approved
        </Tabs.Trigger>
        <Tabs.Trigger
          value="rejected"
          className="px-6 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md"
        >
          Rejected
        </Tabs.Trigger>
      </Tabs.List>

      {/* Pending Tab */}
      <Tabs.Content
        value="pending"
        className="p-6 mt-4 bg-gray-50 rounded-md text-gray-700 shadow-sm"
      >
        <h2 className="text-lg font-bold mb-4">Pending Requests</h2>
        {pendingRequests.length > 0 ? (
          <ul className="space-y-4">
            {pendingRequests.map((req: Request) => (
              <li
                key={req._id}
                className="p-4 bg-white shadow-md rounded-md border border-gray-200"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Name: <span className="font-normal">{req.name}</span>
                    </p>
                    <p className="font-semibold text-gray-800">
                      Component:{" "}
                      <span className="font-normal">{req.component}</span> (x
                      {req.quantity})
                    </p>

                    <p className="font-semibold text-gray-800">
                      Return Date:{" "}
                      <span className="font-normal">
                        {format(new Date(req.date), "dd-MM-yyyy")}
                      </span>
                    </p>
                    <p className="font-semibold text-gray-800 flex items-center">
                      Purpose:
                      <span
                        className="ml-2 text-gray-600 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]"
                        title={req.purpose}
                      >
                        {req.purpose}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger>
                        <IconInfoCircle />
                      </PopoverTrigger>
                      <PopoverContent
                        side="right"
                        align="start"
                        className="p-4 bg-white shadow-md border border-gray-300 rounded-md"
                      >
                        <p className="font-semibold">Name: {req.name}</p>
                        <p>Email: {req.email}</p>
                        <p>Phone: {req.phone}</p>
                        <p>
                          Component: {req.component} (x{req.quantity})
                        </p>
                        <p>Purpose: {req.purpose}</p>
                        <p>Return: {req.date}</p>
                        <div className="w-full grid grid-cols-2"></div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => updateRequestStatus(req, "Approved")}
                    className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => updateRequestStatus(req, "Rejected")}
                    className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600"
                  >
                    ✕ Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending requests.</p>
        )}
      </Tabs.Content>

      {/* Approved Tab */}
      <Tabs.Content
        value="approved"
        className="p-6 mt-4 bg-gray-50 rounded-md text-gray-700 shadow-sm"
      >
        <h2 className="text-lg font-bold mb-4">Approved Requests</h2>
        {approvedRequests.length > 0 ? (
          <div>
            {/* Overdue Requests */}
            {approvedRequests.some(
              (req: Request) => new Date(req.date) < new Date() && !req.returned
            ) && (
              <div>
                <h3 className="text-xl font-bold text-red-600 mb-4">
                  Overdue Requests
                </h3>
                <ul className="space-y-4">
                  {approvedRequests
                    .filter(
                      (req: Request) =>
                        new Date(req.date) < new Date() && !req.returned
                    )
                    .map((req: Request) => (
                      <li
                        key={req._id}
                        className="p-4 bg-red-50 shadow-md rounded-md border border-red-300"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-800">
                              Name:{" "}
                              <span className="font-normal">{req.name}</span>
                            </p>
                            <p className="font-semibold text-gray-800">
                              Component:{" "}
                              <span className="font-normal">
                                {req.component}
                              </span>{" "}
                              (x
                              {req.quantity})
                            </p>
                            <p className="font-semibold text-red-600">
                              Return Date:{" "}
                              <span className="font-normal">
                                {format(new Date(req.date), "dd-MM-yyyy")}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-800 flex items-center">
                              Purpose:
                              <span
                                className="ml-2 text-gray-600 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]"
                                title={req.purpose}
                              >
                                {req.purpose}
                              </span>
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <MarkAsReturnButton
                              req={req}
                              projects={projects}
                              category={category}
                              getReqsFunc={gettingRequests}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Non-Overdue Requests */}
            {approvedRequests.some(
              (req: Request) => new Date(req.date) >= new Date() && !req.returned
            ) && (
              <div>
                <h3 className="text-xl font-bold text-gray-700 mt-8 mb-4">
                  Other Approved Requests
                </h3>
                <ul className="space-y-4">
                  {approvedRequests
                    .filter(
                      (req: Request) =>
                        new Date(req.date) >= new Date() && !req.returned
                    )
                    .map((req: Request) => (
                      <li
                        key={req._id}
                        className="p-4 bg-white shadow-md rounded-md border border-gray-200"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-800">
                              Name:{" "}
                              <span className="font-normal">{req.name}</span>
                            </p>
                            <p className="font-semibold text-gray-800">
                              Component:{" "}
                              <span className="font-normal">
                                {req.component}
                              </span>{" "}
                              (x
                              {req.quantity})
                            </p>
                            <p className="font-semibold text-gray-800">
                              Return Date:{" "}
                              <span className="font-normal">
                                {format(new Date(req.date), "dd-MM-yyyy")}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-800 flex items-center">
                              Purpose:
                              <span
                                className="ml-2 text-gray-600 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]"
                                title={req.purpose}
                              >
                                {req.purpose}
                              </span>
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <MarkAsReturnButton
                              req={req}
                              projects={projects}
                              category={category}
                              getReqsFunc={gettingRequests}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Returned Requests */}
            {approvedRequests.some((req: Request) => req.returned) && (
              <div>
                <h3 className="text-xl font-bold mt-8 mb-4 text-green-500">
                  Returned Components
                </h3>
                <ul className="space-y-4">
                  {approvedRequests
                    .filter((req: Request) => req.returned)
                    .map((req: Request) => (
                      <li
                        key={req._id}
                        className="p-4 bg-gray-50 shadow-md rounded-md border border-gray-300"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-800">
                              Name:{" "}
                              <span className="font-normal">{req.name}</span>
                            </p>
                            <p className="font-semibold text-gray-800">
                              Component:{" "}
                              <span className="font-normal">
                                {req.component}
                              </span>{" "}
                              (x
                              {req.quantity})
                            </p>
                            {req.returnedProject !== "" && (
                              <p className="font-semibold text-gray-800">
                                Returned By Project:{" "}
                                <span className="font-normal">
                                  {req.returnedProject}
                                </span>
                              </p>
                            )}
                            <p className="font-semibold text-gray-800">
                              Return Date:{" "}
                              <span className="font-normal">
                                {format(new Date(req.date), "dd-MM-yyyy")}
                              </span>
                            </p>
                            <p className="font-semibold text-gray-800 flex items-center">
                              Purpose:
                              <span
                                className="ml-2 text-gray-600 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]"
                                title={req.purpose}
                              >
                                {req.purpose}
                              </span>
                            </p>
                          </div>
                          <div>
                            <Popover>
                              <PopoverTrigger>
                                <IconInfoCircle />
                              </PopoverTrigger>
                              <PopoverContent
                                side="right"
                                align="start"
                                className="p-4 bg-white shadow-md border border-gray-300 rounded-md"
                              >
                                <p className="font-semibold">
                                  Name: {req.name}
                                </p>
                                <p>Email: {req.email}</p>
                                <p>Phone: {req.phone}</p>
                                <p>
                                  Component: {req.component} (x{req.quantity})
                                </p>
                                <p>Purpose: {req.purpose}</p>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>No approved requests.</p>
        )}
      </Tabs.Content>

      {/* Rejected Tab */}
      <Tabs.Content
        value="rejected"
        className="p-6 mt-4 bg-gray-50 rounded-md text-gray-700 shadow-sm"
      >
        <h2 className="text-lg font-bold mb-4">Rejected Requests</h2>
        {rejectedRequests.length > 0 ? (
          <ul className="space-y-4">
            {rejectedRequests.map((req: Request) => (
              <li
                key={req._id}
                className="p-4 bg-white shadow-md rounded-md border border-gray-200"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Name: <span className="font-normal">{req.name}</span>
                    </p>
                    <p className="font-semibold text-gray-800">
                      Component:{" "}
                      <span className="font-normal">{req.component}</span> (x
                      {req.quantity})
                    </p>
                    <p className="font-semibold text-gray-800">
                      Return Date:{" "}
                      <span className="font-normal">
                        {format(new Date(req.date), "dd-MM-yyyy")}
                      </span>
                    </p>
                    <p className="font-semibold text-gray-800">
                      Return Date:{" "}
                      <span className="font-normal">
                        {format(new Date(req.date), "dd-MM-yyyy")}
                      </span>
                    </p>
                    <p className="font-semibold text-gray-800 flex items-center">
                      Purpose:
                      <span
                        className="ml-2 text-gray-600 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]"
                        title={req.purpose}
                      >
                        {req.purpose}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger>
                        <IconInfoCircle />
                      </PopoverTrigger>
                      <PopoverContent
                        side="right"
                        align="start"
                        className="p-4 bg-white shadow-md border border-gray-300 rounded-md"
                      >
                        <p className="font-semibold">Name: {req.name}</p>
                        <p>Email: {req.email}</p>
                        <p>Phone: {req.phone}</p>
                        <p>
                          Component: {req.component} (x{req.quantity})
                        </p>
                        <p>Purpose: {req.purpose}</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No rejected requests.</p>
        )}
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default RequestsTabular;
