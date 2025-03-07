import MyInventory from "@/components/MyInventory/myInventory";
import React from "react";

const page = async () => {
  return (
    <div className="p-6 rounded-lg shadow-lg border border-gray-200">
      <MyInventory/>
    </div>
  );
};

export default page;
