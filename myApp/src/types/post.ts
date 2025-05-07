export interface Attachment {
  url: string;
  type: string;
  name: string;
}

export interface Post {
  id: number;
  author_id: number;
  avatar: string;
  username: string;
  time_ago: string;
  content: string;
  attachments: Attachment[];
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_collected: boolean;
  type: 'normal' | 'help';
  status: 'open' | 'closed';
  tags?: string[];
}

export interface PostStatus {
  id: number;
  is_liked: boolean;
  likes_count: number;
  comments_count: number;
}
