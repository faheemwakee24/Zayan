// types.ts or inline in your middleware
export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  isOrganization: boolean;
  organizationName?: string;
  FullName?: string;
  designation?: string;
}

export interface OrganizationRegisterPayload {
  email: string;
  organizationName: string;
  organizationNameArabic: string;
  country: string;
  website: string;
  contactName: string;
  contactPhone: string;
  contactTitle: string;
  contactEmail: string;
  goodGovernance: boolean;
  transparencyReporting: boolean;
  sustainableFunding: boolean;
  impactMeasurement: string;
  shortBio: string;
  organizationImage: string;
  organizationTags: string[];
}

export interface loginPayload {
  email: string;
  password: string;
}

export interface verifyPayload {
  email: string;
  code: string;
}

export interface resendPayload {
  email: string;
}
export interface forgetPasswordPayload {
  email?: string;
}
export interface createPostPayload {
  content: string;
  imageUrl?: string[];
  PostImage?: string;
  videoUrl?: string;
  visibility?: string;
  likes?: number;
  shares?: number;
}
export interface likePostPayload {
  post_id: number;
}
export interface sharePostPayload {
  post_id: number;
}
export interface addCommentPostPayload {
  post_id: number;
  content: string;
}
export interface getbyidPayload {
  userId?: string | number | undefined;
  postId?: string;
}
export interface uploadfilesPayload {
  photos: File[];
}

export interface CreateCoursePayload {
  courseName: string;
  language: string;
  whatTheyLearn: string;
  tags: string[];
  status: string;
  thumbnailUrl: string;
  previewVideoUrl: string;
  topics: Topic[];
}

export interface savepayload {
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  profilePicture: string | null;
}
interface Topic {
  topicTitle: string;
  numberOfChapters: number;
  chapters: Chapter[];
}

interface Chapter {
  chapterTitle: string;
  description: string;
  mediaUrl: string;
}
export interface followpayload {
  id: number;
}

export interface postConnectPayload {
  userId: string;
}
export interface orgpayload {
  id: string;
}
export interface createRoomPayload {
  receiver: string;
}
  export interface createGroupPayload {
    groupName: string;
    users: number[];
    groupPicture: string | null;
  }
  export interface editGroupPayload {
    groupName: string;
    groupPicture: string | null;
  }
export interface createJoinGroup {
  roomId: string;
}
export interface createCryptoTransaction {
  txnId: string;
}
export interface repostPayload {
  id: number;
  dataofcontent: {
    content?: string;
    userId: string;
  };
}
