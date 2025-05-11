export interface ChatSession {
  id: number;
  target_id: number;
  target_name: string;
  target_avatar: string;
  last_message: string;
  last_time: string;
  unread_count: number;
  type: 'private' | 'group';
}

export interface ChatMessage {
  id: number;
  session_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_name: string;
  sender_avatar: string;
  file_name?: string;
  file_size?: number;
  file_url?: string;
  needs_url_fetch?: boolean;
  message_type?: string;
}
