export enum Gender {
  Male = 1,
  Female = 2,
  Unknown = 3,
}

export interface UserExtra {
  gender: Gender;
  birthday: string;
  location: string[];
  school: string;
  age: string;
  constellation: string;
  createTime: string;
  lastLoginTime: string;
}

export interface UserItem {
  id: string;
  username: string;
  email: string;
  avatar: string;
  backgroundImage: string;
  desc: string;
  extra: UserExtra;
  learningProfile: {
    goals: any[];
    style: {
      preference: string;
      schedule: string;
      interaction: string;
    };
    skills: any[];
    history: {
      completedCourses: string[];
      averageScore: number;
      studyHours: number;
    };
    social: {
      preferredGroupSize: number;
      leadership: number;
      cooperation: number;
    };
    motivation: {
      type: string;
      intensity: number;
      persistence: number;
    };
  };
}

export interface UserListResponse {
  data: UserItem[];
  total: number;
  success: boolean;
}

export interface UserInfoResponse {
  data: UserItem;
  success: boolean;
}

export interface UpdateUserParams extends Partial<UserItem> {
  id: string;
}

export interface DeleteUserParams {
  id: string;
}
