
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  BadgeAlert,
  Users,
  BriefcaseBusiness,
  Tag,
  ContactRound,
  Headset,
  Menu,
  LogOut,
  Radio
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Payment', href: '/products', icon: Package },
  { name: 'KYC Pendings', href: '/Kyc', icon: BadgeAlert },
  { name: 'Coupons', href: '/coupons', icon: Tag  },
  { name: 'Contact Us', href: '/Contactus', icon: Headset },
  { name: 'Freelance Hub', href: '/Kyc', icon:ContactRound  },
  { name: 'Job Applied', href: '/Kyc', icon: BriefcaseBusiness },
  { name: 'Webinars', href: '/Kyc', icon: Radio },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 z-40"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center justify-start space-x-2">
               <img src='/Images/CompanyFooterLogo_1.png' alt='' className='w-[150px]'/>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          {!collapsed && user && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <Button
            onClick={logout}
            variant="ghost"
            className={`w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 ${
              collapsed ? 'px-2' : ''
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
