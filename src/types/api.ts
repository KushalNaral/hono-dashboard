export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string | null;
  image: string | null;
  emailVerified: boolean;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  token: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoleExpanded extends Role {
  permissions: string[];
  assets: Asset[];
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  groupName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  resourceType: string;
  resourceId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  data: T;
}

export interface ListAllResponse<T> {
  data: T[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface BulkDeleteResponse {
  deletedCount: number;
}

export interface MePermissionsResponse {
  role: string;
  permissions: string[];
}

export interface AuthSession {
  session: Session;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
}

export type SortDir = "asc" | "desc";

export interface ListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: SortDir;
  [key: string]: string | number | undefined;
}
