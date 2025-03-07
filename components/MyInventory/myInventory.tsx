"use client";
import React, { useEffect, useState } from "react";
import { User, UserInventory } from "@/models/models";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";

const MyInventory = () => {
  const [userInventory, setUserInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = useSelector((state: RootState) => state.UserData.user);
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`/api/user_data?pn=${user.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setUserInventory(data.inventory);
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);
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

  const acquiredInventory = userInventory.filter(
    (item: UserInventory) => item.status === "Approved" && !item.returned
  );
  const pendingInventory = userInventory.filter(
    (item: UserInventory) => item.status === "Pending"
  );
  const processedInventory = userInventory.filter(
    (item: UserInventory) =>
      item.status === "Rejected"
  );

  return (
    <div className="container mx-auto p-4">
      {/* Acquired Inventory */}
      <h2 className="text-xl font-semibold mb-2">Acquired Inventory</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {acquiredInventory.map((item: UserInventory) => (
          <InventoryCard key={item._id} item={item} />
        ))}
      </div>

      {/* Pending & Processed Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pending Inventory */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Pending Requests</h2>
          {pendingInventory.length > 0 ? (
            pendingInventory.map((item: UserInventory) => (
              <InventoryCard key={item._id} item={item} />
            ))
          ) : (
            <p>No pending requests.</p>
          )}
        </div>

        {/* Rejected Inventory */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
                Rejected Requests
          </h2>
          {processedInventory.length > 0 ? (
            processedInventory.map((item: UserInventory) => (
              <InventoryCard key={item._id} item={item} />
            ))
          ) : (
            <p>No rejected requests.</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface CardProps {
    item: UserInventory;
}
const InventoryCard: React.FC<CardProps> = ({ item }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md flex items-center space-x-4">
      <img
        src={`https://utfs.io/f/${item.inventoryImage}`}
        alt={item.inventoryName}
        className="w-24 h-24 object-cover rounded"
      />
      <div>
        <h3 className="text-lg font-medium">{item.inventoryName}</h3>
        <p className="text-sm">Quantity: {item.quantity}</p>
        <p className="text-sm">Purpose: {item.purpose}</p>
        <p className="text-sm">Status: {item.status}</p>
      </div>
    </div>
  );
}

export default MyInventory;