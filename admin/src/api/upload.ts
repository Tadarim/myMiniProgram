import request from "@utils/request";

export interface UploadResponse {
  success: boolean;
  data: {
    id: number;
    fileName: string;
    fileType: string;
    url: string;
    created_at: string;
    status: string;
    is_system: boolean;
  };
}

export async function uploadFile(formData: FormData): Promise<UploadResponse> {
  return request({
    url: "/api/upload",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
} 