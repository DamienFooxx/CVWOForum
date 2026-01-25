export interface BackendTopic {
  topic_id: number;
  name: string;
  description: string;
  created_at: string;
  status: string;
}

export interface BackendPost {
  post_id: number;
  topic_id: number;
  title: string;
  body: string;
  created_at: string;
  created_by: number;
  status: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  author: string;
  avatar?: string;
  postCount: number;
  lastActivity: string;
  category: string;
}

export interface Post {
  id: string;
  topicId: string;
  title: string;
  content: string;
  author: string;
  avatar?: string;
  createdAt: string;
  commentCount: number;
  likes: number;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string; // null for top-level comments, id of parent for replies
  content: string;
  author: string;
  avatar?: string;
  createdAt: string;
  likes: number;
}
