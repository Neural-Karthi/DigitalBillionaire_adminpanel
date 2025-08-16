import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardStats } from "./components/DashboardStats";
import { SalesChart } from "./components/SalesChart";
import { TopProducts } from "./components/TopProducts";

export const Dashboard: React.FC = () => {
  const [filter, setFilter] = useState("thisWeek");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const minDate = "2025-07-10"; 

  const handleFilterChange = (value: string) => {
    if (value === "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
      setShowCustomModal(true); 
    } else {
      setFilter(value);
    }
  };


  const handleCustomSubmit = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const formatDate = (d: Date) =>
        `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
      setFilter(`${formatDate(start)}~${formatDate(end)}`);
      setShowCustomModal(false);
    } else {
      alert("Please select both start and end dates");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="flex flex-col md:flex-row md:items-center md:justify-between"
>
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
    <p className="text-gray-600">
      Welcome back! Here's what's happening with your store.
    </p>
  </div>

 <div className="relative flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2 mt-4 md:mt-0">
  {/* 🔹 Filter Dropdown */}
  <div className="relative">
    <select
      value={filter.includes("~") ? filter : filter}
      onChange={(e) => handleFilterChange(e.target.value)}
      className="appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="last3Days">Last 3 Days</option>
      <option value="last10Days">Last 10 Days</option>
      <option value="thisWeek">This Week</option>
      <option value="thisMonth">This Month</option>
      <option value="LastMonth">Last Month</option>
      <option value="allTime">All Time</option>
    </select>

    {/* 🔹 Custom SVG Arrow */}
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg
        className="w-4 h-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

  {/* 🔹 Custom Range Button */}
  <button
    onClick={() => setShowCustomModal(true)}
    className="px-4 py-2 rounded-lg bg-blue-500 text-white"
  >
    Custom Range
  </button>
</div>

</motion.div>


      {/* 🔹 Pass filter to DashboardStats */}
      <DashboardStats filter={filter} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart filter={filter} />
        <TopProducts filter={filter} />
      </div>

      {/* 🔹 Custom Date Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Select Custom Date Range</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700">Start Date</label>
                <input
  type="date"
  value={customStartDate}
  min={minDate}               // ⬅ block past dates
  onChange={(e) => setCustomStartDate(e.target.value)}
  className="mt-1 border border-gray-300 rounded-lg px-3 py-2 w-full"
/>
              </div>
              <div>
                <label className="block text-gray-700">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  min={minDate}   
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="mt-1 border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomSubmit}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
