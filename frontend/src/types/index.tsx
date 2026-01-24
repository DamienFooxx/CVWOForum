export type PageType = 'home' | 'topics';

export interface APIErrorResponse {
    message?: string;
    error?: string;
}

export interface NavigationItem {
    id: PageType;
    label: string;
    icon: React.ElementType;
}

export interface Topic {
    topic_id: number;
    created_by: number;
    name: string;
    description: string;
    created_at: string; // ISO timestamp string
    updated_at: string;
    status: string;
    removed_at: string;
    removed_by: number;
    removal_reason: string;
    post_count?: number;
    last_active?: string;
}

export interface Post {
    post_id: number;
    topic_id: number;
    created_by: number;
    title: string;
    body: string;
    created_at: string;
    updated_at?: string;
    status: string;
    removed_at: string;
    removed_by: number;
    removal_reason: string;
    username?: string;
    likes?: number;
    comment_count?: number;
}

export interface User {
    user_id: number;
    username: string;
    bio?: string;
    created_at: string;
}

export interface Comment {
    comment_id: number;
    post_id: number;
    commented_by: number;
    parent_id: number | null; // Nullable for top-level comments
    body: string;
    created_at: string;
    updated_at?: string;
    status: string;
    removed_at?: string;
    removed_by?: number;
    removal_reason?: string;
    
    // Optional fields for UI
    username?: string; 
}
