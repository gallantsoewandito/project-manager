"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, FolderKanban, CheckSquare, Settings, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', href: '/dashboard/projects' },
  { icon: CheckSquare, label: 'Tasks', href: '/dashboard/tasks' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    return (
        <aside className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0">
        <div className="p-6">
            <h1 className="text-2xl font-bold">ProjectHub</h1>
        </div>
        <nav className="mt-6">
            {menuItems.map((item) => (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                'flex items-center gap-3 px-6 py-3 hover:bg-slate-800 transition-colors',
                pathname === item.href ? 'bg-slate-800 border-l-4 border-blue-500' : ''
                )}
            >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
            </Link>
            ))}
        </nav>

        {/* User Profile and Logout Section */}
        <div className="p-4 border-t border-slate-800 space-y-3">
            {session?.user && (
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                    {session.user.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                    {session.user.role || 'USER'}
                </p>
                </div>
            </div>
            )}
            
            <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
            <LogOut className="w-4 h-4" />
            Sign Out
            </button>
        </div>
        </aside>
    );
}