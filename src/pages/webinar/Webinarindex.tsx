
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WebinarTable from './Components/WebinarTable'
export const Webinarindex: React.FC = () => {


  return (
    <div className="space-y-6 cursor-pointer">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Webinar</h1>
          <p className="text-gray-600 mt-1">View and manage webinars</p>
        </div>
        {/* <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button> */}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <WebinarTable/>
      </motion.div>
    </div>
  );
};
