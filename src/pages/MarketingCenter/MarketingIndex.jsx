import { motion } from 'framer-motion';

export const MarketingIndex = () => {
  return (
    <div className="space-y-6 cursor-pointer">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Center</h1>
          <p className="text-gray-600 mt-1">Upload and manage all promotional, branding, and affiliate materials</p>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} >
       
      </motion.div>
    </div>
  );
};
