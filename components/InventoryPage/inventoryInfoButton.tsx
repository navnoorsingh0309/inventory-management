import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import { Component } from "@/models/models";

type props = {
  component: Component;
  role: number;
};

const InventoryInfoButton: React.FC<props> = ({ component, role }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="float-right text-md font-bold">
          <IconInfoCircleFilled />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inventory Information</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4 bg-white shadow-lg rounded-2xl w-full">
          {/* Image Section */}
          <img
            src={`https://utfs.io/f/${component.image}`}
            alt={component.component}
            className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
          />

          {/* Component Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-gray-800">
              {component.component}
            </h1>
            <h2 className="text-gray-600">Category: {component.category}</h2>
            <h2 className="text-gray-600">In Stock: {component.inStock}</h2>
            <h2 className="text-gray-600">
              Available: {component.inStock - component.inUse}
            </h2>
            {component.link && (
              <h2 className="text-gray-600">Link: {component.link}</h2>
            )}
          </div>
        </div>
        {/* Used Where Section */}
        {/* Used Where Section */}
        {role !== 0 &&
          component.usedWhere &&
          component.usedWhere.length > 0 && (
            <div className="mt-4 w-full overflow-scroll">
              <h3 className="text-lg font-semibold text-gray-700">
                Used Where:
              </h3>
              <div className="flex space-x-4 w-full mt-2 p-2 rounded-lg">
                {component.usedWhere.map((use) => (
                  <div
                    key={use._id}
                    className="p-4 bg-gray-100 rounded-lg shadow-md"
                  >
                    {use.project ? (
                      <>
                        <p className="font-bold text-gray-800">
                          {use.projectName}
                        </p>
                        <p className="font-medium text-gray-800">{use.name}</p>
                        <p className="text-sm text-gray-600">
                          Email: {use.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          Phone: {use.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {use.quantity}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-gray-800">{use.name}</p>
                        <p className="text-sm text-gray-600">
                          Email: {use.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          Phone: {use.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {use.quantity}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
};

export default InventoryInfoButton;
