import request from "@utils/request";

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  message?: string;
  userInfo: {
    id: number;
    username: string;
    role: string;
  };
  token: string;
}

export const adminLogin = (data: LoginParams) => {
  return request<LoginResult>({
    url: "/api/admin/login",
    method: "post",
    data,
  });
};
