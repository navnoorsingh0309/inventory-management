"use client";

import React, { useEffect, useState } from "react";
import { Component, Project, Request } from "@/models/models";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";
import { format, isAfter, isBefore } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, XCircle, Info, AlertTriangle, Calendar, User, Mail, Phone, Package, FileText, Loader2 } from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkAsReturnButton from "./markAsReturnButton";

const RequestsTabular = () => {
  const [getRequests, setGetRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  
  const user = useSelector((state: RootState) => state.UserData.user);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/request?pn=${user.category}`);
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
  }, [getRequests, user.category]);

  // Function to update request status
  const updateRequestStatus = async (req: Request, status: string) => {
    setProcessingRequestId(req._id);
    
    let alreadyBeingUsed = 0;
    if (status === "Approved") {
      // Checking Stock
      try {
        const response = await fetch(`/api/inventory?pn=${user.category}`);
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
            title: "Insufficient Stock",
            description: `Available: ${component.inStock - component.inUse}, Required: ${req.quantity}`,
            variant: "destructive"
          });
          setProcessingRequestId(null);
          return;
        }
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Failed to load inventory.");
        setProcessingRequestId(null);
        return;
      }

      // Updating Stock
      try {
        const response = await fetch(`/api/inventory`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: user.category,
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
        toast({
          title: "Error",
          description: "Failed to update inventory status",
          variant: "destructive"
        });
        setProcessingRequestId(null);
        return;
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
      toast({
        title: "Error",
        description: "Failed to update user data",
        variant: "destructive"
      });
      setProcessingRequestId(null);
      return;
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
          category: user.category,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update status.");
      }
      
      toast({
        title: status === "Approved" ? "Request Approved" : "Request Rejected",
        description: `The request from ${req.name} has been ${status.toLowerCase()}.`,
      });
      
      gettingRequests();
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive"
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Getting Projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/projects?pn=${user.category}`);
        const data = await response.json();
        const projectTitles = data.projects.map(
          (project: Project) => project.title
        );
        setProjects(projectTitles);
      } catch (err) {
        console.error("Error fetching projects:", err);
        toast({
          title: "Error",
          description: "Failed to fetch projects",
          variant: "destructive"
        });
      }
    };
    fetchProjects();
  }, [user.category, toast]);

  const gettingRequests = () => {
    setGetRequests(!getRequests);
  };

  // Filter requests based on search query
  const filterRequests = (requests: Request[]) => {
    if (!searchQuery) return requests;
    
    return requests.filter((req: Request) => 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredPendingRequests = filterRequests(pendingRequests);
  const filteredApprovedRequests = filterRequests(approvedRequests);
  const filteredRejectedRequests = filterRequests(rejectedRequests);

  if (user.role === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-[50vh] text-center p-6"
      >
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h3>
        <p className="text-gray-600">You are not authorized to access this page.</p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full flex flex-col justify-center items-center h-[60vh]"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <Loader2 className="w-16 h-16 absolute top-0 left-0 text-blue-500 animate-spin" />
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading requests...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full flex flex-col items-center justify-center h-[50vh] text-center p-6"
      >
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Try Again
        </Button>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Inventory Requests
        </h1>
        <p className="text-gray-600 mt-2">
          Manage and process all inventory requests in one place
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-4 mb-8"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md p-4 border-l-4 border-amber-500"
          onClick={() => setActiveTab("pending")}
        >
          <div className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              <p className="text-2xl font-bold">{pendingRequests.length}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-full">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500"
          onClick={() => setActiveTab("approved")}
        >
          <div className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm text-gray-500">Approved Requests</p>
              <p className="text-2xl font-bold">{approvedRequests.length}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500"
          onClick={() => setActiveTab("rejected")}
        >
          <div className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm text-gray-500">Rejected Requests</p>
              <p className="text-2xl font-bold">{rejectedRequests.length}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative mb-6"
      >
        <Info className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, component, or purpose..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-6 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 bg-gray-100/40 backdrop-blur-lg rounded-xl p-1.5">
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending
          </TabsTrigger>
          <TabsTrigger 
            value="approved" 
            className="data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approved
          </TabsTrigger>
          <TabsTrigger 
            value="rejected" 
            className="data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejected
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent
          value="pending"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-amber-500" />
                Pending Requests
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Review and process incoming inventory requests
              </p>
            </div>

            <AnimatePresence>
              {filteredPendingRequests.length > 0 ? (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-gray-100"
                >
                  {filteredPendingRequests.map((req: Request) => (
                    <motion.div
                      key={req._id}
                      variants={itemVariants}
                      className="p-6 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <h3 className="font-medium text-gray-900">{req.name}</h3>
                          </div>
                          
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">
                              {req.component} <Badge variant="outline" className="ml-1">{req.quantity}</Badge>
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">
                              Return by: {format(new Date(req.date), "MMM dd, yyyy")}
                            </span>
                          </div>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-start">
                                  <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                  <span className="text-gray-700 line-clamp-1 max-w-md">
                                    {req.purpose}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{req.purpose}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent side="left" align="center" className="w-80 p-0">
                              <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h4 className="font-semibold text-gray-900">Request Details</h4>
                              </div>
                              <div className="p-4 space-y-3">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">{req.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">{req.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">{req.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {req.component} <Badge variant="outline" className="ml-1">{req.quantity}</Badge>
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    Return by: {format(new Date(req.date), "MMM dd, yyyy")}
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                  <span className="text-sm text-gray-700">{req.purpose}</span>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateRequestStatus(req, "Approved")}
                              className="bg-green-500 hover:bg-green-600 text-white"
                              disabled={processingRequestId === req._id}
                            >
                              {processingRequestId === req._id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={() => updateRequestStatus(req, "Rejected")}
                              className="bg-red-500 hover:bg-red-600 text-white"
                              disabled={processingRequestId === req._id}
                            >
                              {processingRequestId === req._id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <Clock className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">No pending requests</h3>
                  <p className="text-gray-500 mt-2 max-w-md">
                    {searchQuery 
                      ? "No pending requests match your search criteria." 
                      : "There are no pending inventory requests at the moment."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent
          value="approved"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Approved Requests
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Track approved inventory requests and manage returns
              </p>
            </div>

            <AnimatePresence>
              {filteredApprovedRequests.length > 0 ? (
                <div>
                  {/* Overdue Requests */}
                  {filteredApprovedRequests.some(
                    (req: Request) => isBefore(new Date(req.date), new Date()) && !req.returned
                  ) && (
                    <div className="mt-4">
                      <div className="px-6 py-3 bg-red-50">
                        <h3 className="text-lg font-semibold text-red-700 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Overdue Requests
                        </h3>
                      </div>
                      
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="divide-y divide-gray-100"
                      >
                        {filteredApprovedRequests
                          .filter(
                            (req: Request) => isBefore(new Date(req.date), new Date()) && !req.returned
                          )
                          .map((req: Request) => (
                            <motion.div
                              key={req._id}
                              variants={itemVariants}
                              className="p-6 bg-red-50/50 hover:bg-red-50 transition-colors duration-150"
                            >
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                    <h3 className="font-medium text-gray-900">{req.name}</h3>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-700">
                                      {req.component} <Badge variant="outline" className="ml-1">{req.quantity}</Badge>
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-red-500 mr-2" />
                                    <span className="text-red-600 font-medium">
                                      Overdue since: {format(new Date(req.date), "MMM dd, yyyy")}
                                    </span>
                                  </div>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-start">
                                          <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                          <span className="text-gray-700 line-clamp-1 max-w-md">
                                            {req.purpose}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{req.purpose}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="sm" className="flex items-center">
                                        <Info className="h-4 w-4 mr-2" />
                                        Details
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent side="left" align="center" className="w-80 p-0">
                                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                                        <h4 className="font-semibold text-gray-900">Request Details</h4>
                                      </div>
                                      <div className="p-4 space-y-3">
                                        <div className="flex items-center">
                                          <User className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">{req.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">{req.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">{req.phone}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">
                                            {req.component} <Badge variant="outline" className="ml-1">{req.quantity}</Badge>
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          <Calendar className="h-4 w-4 text-red-500 mr-2" />
                                          <span className="text-sm text-red-600 font-medium">
                                            Overdue since: {format(new Date(req.date), "MMM dd, yyyy")}
                                          </span>
                                        </div>
                                        <div className="flex items-start">
                                          <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                          <span className="text-sm text-gray-700">{req.purpose}</span>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  
                                  <MarkAsReturnButton
                                    req={req}
                                    projects={projects}
                                    category={user.category}
                                    getReqsFunc={gettingRequests}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </motion.div>
                    </div>
                  )}

                  {/* Non-Overdue Requests */}
                  {filteredApprovedRequests.some(
                    (req: Request) => isAfter(new Date(req.date), new Date()) && !req.returned
                  ) && (
                    <div className="mt-4">
                      <div className="px-6 py-3 bg-green-50">
                        <h3 className="text-lg font-semibold text-green-700 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Active Requests
                        </h3>
                      </div>
                      
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="divide-y divide-gray-100"
                      >
                        {filteredApprovedRequests
                          .filter(
                            (req: Request) => isAfter(new Date(req.date), new Date()) && !req.returned
                          )
                          .map((req: Request) => (
                            <motion.div
                              key={req._id}
                              variants={itemVariants}
                              className="p-6 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                    <h3 className="font-medium text-gray-900">{req.name}</h3>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-700">
                                      {req.component} <Badge variant="outline" className="ml-1">{req.quantity}</Badge>
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-700">
                                      Return by: {format(new Date(req.date), "MMM dd, yyyy")}
                                    </span>
                                  </div>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-start">
                                          <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                          <span className="text-gray-700 line-clamp-1 max-w-md">
                                            {req.purpose}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{req.purpose}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="sm" className="flex items-center">
                                        <Info className="h-4 w-4 mr-2" />
                                        Details
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent side="left" align="center" className="w-80 p-0">
                                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                                        <h4 className="font-semibold text-gray-900">Request Details</h4>
                                      </div>
                                      <div className="p-4 space-y-3">
                                        <div className="flex items-center">
                                          <User className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">{req.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">{req.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">{req.phone}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">
                                            {req.component} <Badge variant="outline" className="ml-1">{req.quantity}</Badge>
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">
                                            Return by: {format(new Date(req.date), "MMM dd, yyyy")}
                                          </span>
                                        </div>
                                        <div className="flex items-start">
                                          <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                          <span className="text-sm text-gray-700">{req.purpose}</span>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  
                                  <MarkAsReturnButton
                                    req={req}
                                    projects={projects}
                                    category={user.category}
                                    getReqsFunc={gettingRequests}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </motion.div>
                    </div>
                  )}

                  {/* Returned Requests */}
                  {filteredApprovedRequests.some((req: Request) => req.returned) && (
                    <div className="mt-4">
                      <div className="px-6 py-3 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-gray-500" />
                          Returned Components
                        </h3>
                      </div>
                      
                      <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="divide-y divide-gray-100"
                      >
                        {filteredApprovedRequests
                          .filter((req: Request) => req.returned)
                          .map((req: Request) => (
                            <motion.div
                              key={req._id}
                              variants={itemVariants}
                              className="p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors duration-150"
                            >
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                    <h3 className="font-medium text-gray-900">{req.name}</h3>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-700">
                                      {req.component} <Badge variant="outline" className="ml-1">{req.quantity}</Badge>
                                    </span>
                                  </div>
                                  
                                  {req.returnedProject && (
                                    <div className="flex items-center">
                                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                      <span className="text-gray-700">
                                        Used in project: <Badge variant="secondary" className="ml-1">{req.returnedProject}</Badge>
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                    <span className="text-gray-700">
                                      Return date: {format(new Date(req.date), "MMM dd, yyyy")}
                                    </span>
                                  </div>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-start">
                                          <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                          <span className="text-gray-700 line-clamp-1 max-w-md">
                                            {req.purpose}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{req.purpose}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="sm" className="flex items-center">
                                        <Info className="h-4 w-4 mr-2" />
                                        Details
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent side="left" align="center" className="w-80 p-0">
                                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                                        <h4 className="font-semibold text-gray-900">Request Details</h4>
                                      </div>
                                      <div className="p-4 space-y-3">
                                        <div className="flex items-center">
                                          <User className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">{req.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">{req.email}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">{req.phone}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                                          <span className="text-sm text-gray-700">
                                            {req.component} <Badge variant="outline" className="ml-1">{req.quantity}</Badge>
                                          </span>
                                        </div>
                                        {req.returnedProject && (
                                          <div className="flex items-center">
                                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-700">
                                              Used in project: {req.returnedProject}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex items-start">
                                          <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                          <span className="text-sm text-gray-700">{req.purpose}</span>
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </motion.div>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <CheckCircle className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">No approved requests</h3>
                  <p className="text-gray-500 mt-2 max-w-md">
                    {searchQuery 
                      ? "No approved requests match your search criteria." 
                      : "There are no approved inventory requests at the moment."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent
          value="rejected"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
                Rejected Requests
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                View history of rejected inventory requests
              </p>
            </div>

            <AnimatePresence>
              {filteredRejectedRequests.length > 0 ? (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="divide-y divide-gray-100"
                >
                  {filteredRejectedRequests.map((req: Request) => (
                    <motion.div
                      key={req._id}
                      variants={itemVariants}
                      className="p-6 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <h3 className="font-medium text-gray-900">{req.name}</h3>
                          </div>
                          
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">
                              {req.component} <Badge variant="outline" className="ml-1">{req.quantity}</Badge>
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">
                              Return date: {format(new Date(req.date), "MMM dd, yyyy")}
                            </span>
                          </div>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-start">
                                  <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                  <span className="text-gray-700 line-clamp-1 max-w-md">
                                    {req.purpose}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{req.purpose}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent side="left" align="center" className="w-80 p-0">
                              <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h4 className="font-semibold text-gray-900">Request Details</h4>
                              </div>
                              <div className="p-4 space-y-3">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">{req.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">{req.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">{req.phone}</span>
                                </div>
                                <div className="flex items-center">
                                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {req.component} <Badge variant="outline" className="ml-1">{req.quantity}</Badge>
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    Return date: {format(new Date(req.date), "MMM dd, yyyy")}
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                                  <span className="text-sm text-gray-700">{req.purpose}</span>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <XCircle className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700">No rejected requests</h3>
                  <p className="text-gray-500 mt-2 max-w-md">
                    {searchQuery 
                      ? "No rejected requests match your search criteria." 
                      : "There are no rejected inventory requests at the moment."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default RequestsTabular;
