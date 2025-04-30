export interface Post {
  id: number;
  authorId: number;
  avatar: string;
  username: string;
  timeAgo: string;
  content: string;
  backgroundImage?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isCollected: boolean;
  // 新增互助相关字段
  type: 'normal' | 'help';
  rewardPoints: number;
  status: 'open' | 'closed';
  tags: string[];
}
