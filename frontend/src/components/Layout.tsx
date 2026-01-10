import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, PenTool, BarChart3, History, Table } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();


    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Tracker' },
        { path: '/log', icon: PenTool, label: 'Log' },
        { path: '/bulk', icon: Table, label: 'Bulk' },
        { path: '/history', icon: History, label: 'History' },
        { path: '/stats', icon: BarChart3, label: 'Stats' },
        { path: '/config', icon: Settings, label: 'Config' },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Sidebar / Mobile Bottom Bar */}
            <nav className="fixed md:relative bottom-0 w-full md:w-20 md:h-screen bg-card border-t md:border-t-0 md:border-r border-border z-50 flex md:flex-col justify-around md:justify-start md:pt-8 items-center p-2 md:gap-8">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            'p-3 rounded-md transition-all duration-200 hover:bg-accent',
                            location.pathname === item.path
                                ? 'text-primary bg-accent'
                                : 'text-muted-foreground'
                        )}
                        title={item.label}
                    >
                        <item.icon size={24} />
                    </Link>
                ))}\n            </nav>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pb-20 md:pb-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
