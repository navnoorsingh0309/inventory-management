"use client";

import React from "react";
import { IconPlus } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadButton } from "@/lib/utils/uploadthing";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SuperAdminInventoryCategoryCombo from "./InventoryPage/superAdminInventoryCategory";

interface Props {
  category: string;
  isSuperAdmin: boolean;
}

const AddProjectButton: React.FC<Props> = ({ category, isSuperAdmin }) => {
  const [title, setTitle] = useState("");
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const [projCategory, setProjCategory] = useState(category);
  const { toast } = useToast();

  // Submit
  const addProject = async () => {
    try {
      await fetch(`/api/projects`, {
        method: "POST",
        body: JSON.stringify({
          category: projCategory,
          title: title,
          leadName: leadName,
          leadEmail: leadEmail,
          image: image,
          completed: false,
          startDate: new Date().toISOString(),
          endDate: "Ongoing",
        }),
        headers: {
          "Content-type": "application/json",
        },
      });
    } catch (error) {
      console.log(error);
      toast({ title: "An error has occurred" });
    }
  };
  const handleSubmit = () => {
    if (!image) {
      toast({ title: "Please upload an image before submitting." });
      return;
    }
    addProject();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="float-right text-md font-bold">
          <IconPlus />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-lg font-bold">
                Title
              </Label>
              <Input
                id="name"
                placeholder="Inverted Walker"
                className="col-span-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-lg font-bold">
                Category
              </Label>
              {isSuperAdmin ? <SuperAdminInventoryCategoryCombo onChange={setProjCategory}/> : (
                <Label htmlFor="name" className="text-right text-lg font-black">
                  {category}
                </Label>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-lg font-bold">
                Lead Name
              </Label>
              <Input
                id="name"
                placeholder="Navnoor Singh Bal"
                className="col-span-3"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-lg font-bold">
                Lead Email
              </Label>
              <Input
                id="name"
                placeholder="2022eeb1193@iitrpr.ac.in"
                className="col-span-3"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 py-4">
              <Label className="text-lg font-bold">Image</Label>
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    setImage(res[0].key);
                    setImageName(res[0].name);
                    alert("Upload Completed");
                  }
                }}
                onUploadError={(error: Error) => {
                  alert(`ERROR! ${error.message}`);
                }}
              />
              {imageName && (
                <div style={{ marginTop: "10px" }} className="mb-2">
                  <label>Uploaded Image:</label>
                  <span style={{ marginLeft: "5px", fontWeight: "bold" }}>
                    {imageName}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button type="submit">Add Project</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectButton;
