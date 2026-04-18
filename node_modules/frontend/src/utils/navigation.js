import { LayoutDashboard, BookOpen, FileText, Users, Settings, Shield, BarChart3, HelpCircle, UserCog, PlusCircle, Eye, TrendingUp } from 'lucide-react';

// All students see student navigation
export const studentNavItems = [
  { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Profile', path: '/student/profile', icon: UserCog },
  { name: 'Tests', path: '/student/tests', icon: BookOpen },
  { name: 'Results', path: '/student/results', icon: FileText },
  { name: 'Performance Analytics', path: '/student/analytics', icon: TrendingUp },
];

// Admin view for tests
export const adminTestNavItem = { name: 'Tests', path: '/admin/tests', icon: BookOpen };

// Admin can only add tests
export const adminNavItems = [
  { name: 'Add Test', path: '/admin/questions', icon: PlusCircle },
];

// Super admin has full access
export const superAdminNavItems = [
  { name: 'Manage Admins', path: '/superadmin/admins', icon: UserCog },
  { name: 'All Users', path: '/superadmin/users', icon: Users },
  { name: 'Platform Analytics', path: '/superadmin/analytics', icon: BarChart3 },
];

export const getNavItems = (role) => {
  switch (role) {
    case 'super_admin':
      // Super admin uses admin tests instead of student tests
      return [
        ...studentNavItems.filter(item => item.name !== 'Tests'),
        adminTestNavItem,
        ...adminNavItems,
        ...superAdminNavItems
      ];
    case 'admin':
      // Admin uses admin tests instead of student tests
      return [
        ...studentNavItems.filter(item => item.name !== 'Tests'),
        adminTestNavItem,
        ...adminNavItems
      ];
    case 'student':
    default:
      // Students only see student navigation
      return studentNavItems;
  }
};
