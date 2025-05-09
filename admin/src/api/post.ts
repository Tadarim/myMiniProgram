import request from "../utils/request";

export interface PostItem {
  id: number;
  author_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  type: string;
  status: 'public' | 'private';
  attachments:
    | string
    | Array<{
        url: string;
        fileName: string;
        fileType: string;
      }>;
  username: string;
  avatar: string;
  time_ago: string;
  likes_count: number;
  comments_count: number;
  collections_count: number;
  is_liked: boolean;
  is_collected: boolean;
  tags: string;
}

export interface ApiResponse<T> {
  code: number;
  success: boolean;
  data: T;
  total: number;
  message: string;
}

// 获取帖子列表
export const getPosts = async (params: {
  current: number;
  pageSize: number;
  content?: string;
  username?: string;
  type?: string;
}) => {
  try {
    const response = await request.get<PostItem[]>("/posts/list", {
      params: {
        page: params.current,
        pageSize: params.pageSize,
        keyword: params.content || params.username,
        type: params.type,
      },
    });

    // 处理 attachments 字段，确保它是数组
    const formattedData = response.data.map((post: PostItem) => ({
      ...post,
      attachments:
        typeof post.attachments === "string"
          ? JSON.parse(post.attachments)
          : post.attachments || [],
    }));

    return {
      data: formattedData,
      success: true,
      total: response.data.length,
    };
  } catch (error) {
    console.log(error);
    throw new Error("获取帖子列表失败");
  }
};

// 删除帖子
export const deletePost = async (id: number) => {
  try {
    await request.delete(`/posts/${id}`);
    return true;
  } catch (error) {
    throw new Error("删除失败");
  }
};

// 切换帖子状态
export const togglePostStatus = async (post: PostItem) => {
  try {
    const newStatus = post.status === "public" ? "private" : "public";
    await request.put(`/posts/${post.id}/status`, {
      status: newStatus,
    });
    return newStatus;
  } catch (error) {
    throw new Error("状态切换失败");
  }
};
