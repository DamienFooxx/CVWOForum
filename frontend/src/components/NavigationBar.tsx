import React from 'react';
import { cn } from '../lib/utils';
import { Home, MessageSquare, Search, Bell, User } from 'lucide-react';
import type {PageType, NavigationItem} from '../types'; // Import from central file

// --- Configuration ---

const NAV_ITEMS: NavigationItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'topics', label: 'Topics', icon: MessageSquare },
];

// --- Components ---

interface NavbarProps {
    currentPage: PageType;
    onNavigate: (page: PageType) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen items-center justify-between px-4 md:px-8">

                {/* Left: Logo & Nav */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                        onClick={() => onNavigate('home')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') onNavigate('home');
                        }}
                    >
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-primary" />
                        </div>
                        <span className="text-lg font-medium tracking-tight text-foreground">
              CVWO Forum
            </span>
                    </div>

                    {/* Desktop Navigation (Mapped!) */}
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
                    {/* Search */}
                    <div className="hidden md:flex items-center relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="h-9 w-64 rounded-xl border border-input bg-input-background px-9 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>

                    {/* Icons */}
                    <IconButton icon={Bell} label="Notifications" />
                    <IconButton icon={User} label="User Profile" />
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