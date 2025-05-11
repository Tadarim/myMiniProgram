// 群组类型定义
export interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  cover_image?: string;
  avatar?: string;
  creator_id: number;
  topic_id?: number;
  topic_name?: string;
  created_at: string;
  updated_at?: string;
  member_count: number;
  max_members?: number;
  is_active?: boolean;
  is_joined?: boolean;
  last_message?: string;
  last_activity_time?: string;
  unread_count?: number;
  topics?: string[];
  activity_level?: number;
  activities?: GroupActivity[];
  session_id?: number;  // 会话ID
}

// 群组活动类型
export interface GroupActivity {
  id: number;
  group_id: number;
  title: string;
  content: string;
  time: string;
  creator_id: number;
  creator_name?: string;
}

// 群组成员类型
export interface GroupMember {
  user_id: number;
  group_id: number;
  username: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

// 群组详情类型
export interface GroupDetail extends StudyGroup {
  members: GroupMember[];
  is_owner: boolean;
  is_admin: boolean;
}

// 创建群组请求参数
export interface CreateGroupParams {
  name: string;
  description?: string;
  cover_image?: string;
  topic_id?: number;
  max_members?: number;
}
