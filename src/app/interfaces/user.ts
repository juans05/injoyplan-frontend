export type UserType = 'NORMAL' | 'COMPANY';

export interface UserProfile {
  id: string;
  userId: string;
  avatar?: string | null;
  coverImage?: string | null;
  description?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  ruc?: string | null;
  razonSocial?: string | null;
  dni?: string | null;
  fichaRucUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCounts {
  followers: number;
  following: number;
  posts: number;
  events: number;
}

export interface UserDTO {
  id: string;
  email: string;
  username?: string;
  userType: UserType;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  profile?: UserProfile | null;
  _count?: Partial<UserCounts>;
  // Optional field returned by GET /users/:id
  isFollowing?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
