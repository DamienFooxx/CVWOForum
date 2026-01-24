import React from 'react';
import { cn } from '../lib/utils';
import { Home, Bell, User, LogIn, LogOut } from 'lucide-react';
import type {PageType, NavigationItem} from '../types';

// --- Configuration ---

const NAV_ITEMS: NavigationItem[] = [
    { id: 'home', label: 'Home', icon: Home },
];

// --- Components ---

interface NavbarProps {
    currentPage: PageType;
    onNavigate: (page: PageType) => void;
    isAuthenticated: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
}

export function Navbar({ currentPage, onNavigate, isAuthenticated, onLoginClick, onLogoutClick }: NavbarProps) {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-6">
                    <div 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => onNavigate('home')}
                    >
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-primary" />
                        </div>
                        <span className="text-lg font-medium tracking-tight text-foreground">
                            CVWO Forum
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => (
                            <NavItem
                                key={item.id}
                                icon={<item.icon className="h-4 w-4" />}
                                label={item.label}
                                isActive={currentPage === item.id}
                                onClick={() => onNavigate(item.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <IconButton icon={Bell} label="Notifications" />
                            <div className="flex items-center gap-2">
                                <IconButton icon={User} label="User Profile" />
                                <button 
                                    onClick={onLogoutClick}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" strokeWidth={1.5} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <LogIn className="h-4 w-4" />
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

// --- Sub-Components ---

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

// Extracted for cleaner JSX in the main component
function IconButton({ icon: Icon, label }: { icon: React.ElementType, label: string }) {
    return (
        <button
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label={label}
        >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
        </button>
    );
}