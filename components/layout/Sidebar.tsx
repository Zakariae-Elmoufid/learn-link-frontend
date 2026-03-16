"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  BookOpen,
  Users,
  MessageSquare,
  Globe,
  Settings,
  LogOut,
  Award,
  Calendar,
  UserPlus,
  Shield,
  FileWarning,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuthStore } from "../../stores";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/student",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "My Profile",
    href: "/student/profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    label: "Courses",
    href: "/student/courses",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    label: "Connections",
    href: "/student/connections",
    icon: <UserPlus className="h-5 w-5" />,
  },

  {
    label: "Messages",
    href: "/student/messages",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: "Community",
    href: "/student/community",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    label: "Planner",
    href: "/student/planner",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: "Achievements",
    href: "/student/achievements",
    icon: <Award className="h-5 w-5" />,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Settings",
    href: "/student/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Moderators",
    href: "/admin/moderators",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    label: "Moderation",
    href: "/admin/moderation",
    icon: <FileWarning className="h-5 w-5" />,
  },
];

const adminBottomNavItems: NavItem[] = [
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

const moderatorNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/moderator",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Moderation",
    href: "/moderator/moderation",
    icon: <FileWarning className="h-5 w-5" />,
  },
];

const moderatorBottomNavItems: NavItem[] = [
  {
    label: "Settings",
    href: "/moderator/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const activeNavItems = user?.role === 'ADMIN'
    ? adminNavItems
    : user?.role === 'MODERATOR'
      ? moderatorNavItems
      : mainNavItems;
  const activeBottomNavItems = user?.role === 'ADMIN'
    ? adminBottomNavItems
    : user?.role === 'MODERATOR'
      ? moderatorBottomNavItems
      : bottomNavItems;

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-200">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            LearnLink
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {activeNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-slate-200 px-3 py-4 dark:border-slate-800">
          {activeBottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href as Route}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
