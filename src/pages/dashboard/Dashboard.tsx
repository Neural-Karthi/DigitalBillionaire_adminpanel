
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardStats } from './components/DashboardStats';
import { SalesChart } from './components/SalesChart';
import { TopProducts } from './components/TopProducts';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </motion.div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <TopProducts />
      </div>

      {/* <RecentActivity /> */}
    </div>
  );
};
