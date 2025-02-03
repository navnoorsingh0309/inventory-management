"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import IssueInventoryButton from "./issueInventoryButton";
import EditInventoryButton from "./editInventoryButton";
import { Admin, Component, User } from "@/models/models";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { IconTrash } from "@tabler/icons-react";
import InventoryInfoButton from "./inventoryInfoButton";
import { useToast } from "@/hooks/use-toast";

interface Props {
  user: User;
  category: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const InventoryTable: React.FC<Props> = ({
  user,
  category,
  isAdmin,
  isSuperAdmin,
}) => {
  const [inventory, setInventory] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchInventory = async () => {
      if (isAdmin) {
        try {
          const response = await fetch(`/api/inventory?pn=${category}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setInventory(data.inventory);
        } catch (err) {
          console.error("Error fetching inventory:", err);
          setError("Failed to load inventory.");
        } finally {
          setLoading(false);
        }
      } else {
        try {
          // Fetch categories
          const res = await fetch("/api/admin");
          const data = await res.json();
          const AdminsData = data.admins;
          const newCategories = ["BoST", ...AdminsData.map((admin: Admin) => admin.category)];
      
          // Fetch inventory **after** categories are set
          const inventoryData = await Promise.all(
            newCategories.map(async (category) => {
              const response = await fetch(`/api/inventory?pn=${category}`);
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              const data = await response.json();
              return data.inventory;
            })
          );
      
          setInventory(inventoryData.flat());
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to load data.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInventory();
  }, []);

  // Real time changes
  const removeBlock = (id: string) => {
    setInventory((prevInventory) =>
      prevInventory.filter((item: Component) => item._id !== id)
    );
  };

  const deleteInventory = async (id: string, cat: string) => {
    try {
      const response = await fetch(`/api/inventory`, {
        method: "DELETE",
        body: JSON.stringify({
          _id: id,
          category: cat,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      await response.json();
      removeBlock(id);
      toast({title: "Deleted!!"})
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err);
    }
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
    <Table>
      <TableCaption>A list of your inventory.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>Component</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>In Stock</TableHead>
          <TableHead>In Use</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {inventory.map((item: Component) => (
          <TableRow key={item._id}>
            <TableCell className="w-[100px]">
              <img
                src={`https://utfs.io/f/${item.image}`}
                alt={item.component}
                className="w-10 h-10 rounded-full"
              />
            </TableCell>
            <TableCell className="font-medium w-[300px]">
              {item.component}
            </TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.inStock}</TableCell>
            <TableCell>{item.inUse}</TableCell>
            <TableCell className="text-right space-x-2">
              {isAdmin || isSuperAdmin ? (
                <div className="flex space-x-2 justify-end">
                  <InventoryInfoButton component={item} />
                  <EditInventoryButton component={item} category={category} />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className="bg-red-700">
                        <IconTrash />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">
                            Delete this Inventory
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Are your sure want to delete this Inventory?
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Button
                            onClick={() => {
                              deleteInventory(item._id, item.category);
                            }}
                          >
                            Yes
                          </Button>
                          <Button>No</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {/*dsafjaksfj*/}
                </div>
              ) : (
                <IssueInventoryButton component={item} user={user} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default InventoryTable;
