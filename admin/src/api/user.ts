import request from "@utils/request";
import { UserItem, UserListResponse, UserInfoResponse } from "../types/user";

export const getUserList = async (params?: any): Promise<UserListResponse> => {
  return request.get("/user", { params });
};

export const getUserInfo = async (id: string): Promise<UserInfoResponse> => {
  return request.get(`/user/${id}`);
};

export const updateUser = async (
  id: string,
  data: Partial<UserItem>
): Promise<UserInfoResponse> => {
  return request.put(`/user/${id}`, data);
};

export const deleteUser = async (id: string): Promise<{ success: boolean }> => {
  return request.delete(`/user/${id}`);
};
