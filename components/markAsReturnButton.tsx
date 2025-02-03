"use client";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Request } from "@/models/models";
import { useToast } from "@/hooks/use-toast";

interface props {
  req: Request;
  projects: string[];
  category: string;
  getReqsFunc: () => void;
}

const MarkAsReturnButton: React.FC<props> = ({
  req,
  projects,
  category,
  getReqsFunc,
}) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const { toast } = useToast();

  const returningComponent = async (type: number) => {
    try {
      const promises: Promise<Response>[] = [];

      // Add inventory update to promises only if type === 0
      if (type === 0) {
        const inventoryUpdatePromise = fetch(`api/inventory`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: category,
            _id: req.inventoryId,
            reqId: req._id,
            task: 2,
            quantity: req.quantity,
          }),
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`Inventory update failed: ${response.statusText}`);
          }
          return response.json(); // If you expect JSON response, handle parsing here
        });

        promises.push(inventoryUpdatePromise);
      } else {
        const inventoryUpdatePromise = fetch(`api/inventory`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: category,
            _id: req.inventoryId,
            reqId: req._id,
            task: 3,
            quantity: req.quantity,
            project: value,
          }),
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`Inventory update failed: ${response.statusText}`);
          }
          return response.json(); // If you expect JSON response, handle parsing here
        });

        promises.push(inventoryUpdatePromise);
      }

      // Request update promise
      const requestUpdatePromise = fetch(`api/request`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: category,
          _id: req._id,
          task: 1,
          returnedProject: value,
        }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`Request update failed: ${response.statusText}`);
        }
        return response.json();
      });

      promises.push(requestUpdatePromise);

      // Returning user component
      try {
        await fetch(`/api/user_data?pn=${req.userId}`, {
          method: "PUT",
          body: JSON.stringify({
            task: 1,
            reqId: req._id,
            returned: true,
          }),
        });
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }

      // Execute all promises concurrently
      const results = await Promise.all(promises);

      // Log responses based on conditions
      if (type === 0) {
        console.log("Inventory response:", results[0]); // Inventory response
        console.log("Request response:", results[1]); // Request response
      } else {
        console.log("Request response:", results[0]); // Only request response
      }
      toast({ title: "Returned!!" });
      getReqsFunc();
    } catch (err) {
      console.error("Error in processing requests:", err);
      alert(err);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value !== "")
      returningComponent(1);
    else
      alert("Select a project");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition">
          Mark as Returned
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Mark as returned</h4>
            <p className="text-sm text-muted-foreground">
              Mark this component returned as
            </p>
          </div>
          <div className="grid gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Project</Button>
              </DialogTrigger>
              <DialogContent className="w-fit">
                <DialogHeader>
                  <DialogTitle>Mark return as project</DialogTitle>
                  <form
                    onSubmit={handleFormSubmit}
                    className="flex items-center space-x-2"
                  >
                    <div className="grid flex-1 gap-2">
                      <label htmlFor="projectName" className="sr-only">
                        Project Name
                      </label>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-[200px] justify-between"
                          >
                            {value
                              ? projects.find((project) => project === value)
                              : "Select Project..."}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search Project..." />
                            <CommandList>
                              <CommandEmpty>No project found.</CommandEmpty>
                              <CommandGroup>
                                {projects.map((project) => (
                                  <CommandItem
                                    key={project}
                                    value={project}
                                    onSelect={(currentValue) => {
                                      setValue(
                                        currentValue === value
                                          ? ""
                                          : currentValue
                                      );
                                      setOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        value === project
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {project}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600"
                    >
                      Submit
                    </button>
                  </form>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Button onClick={() => returningComponent(0)}>Component</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MarkAsReturnButton;
