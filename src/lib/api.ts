import type {
  Asset,
  AuthSession,
  BulkDeleteResponse,
  DeleteResponse,
  ListAllResponse,
  ListParams,
  MePermissionsResponse,
  PaginatedResponse,
  Permission,
  RoleExpanded,
  SingleResponse,
  User,
  Role,
} from "@/types/api";

class ApiClient {
  private baseUrl = "/api";

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers);

    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: res.statusText }));
      throw new ApiError(res.status, body.error ?? body.message ?? "Request failed");
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  private buildQuery(params?: ListParams): string {
    if (!params) return "";
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    return qs ? `?${qs}` : "";
  }

  // Generic CRUD Wrapper Methods
  async listResource<T>(resource: string, params?: ListParams): Promise<PaginatedResponse<T>> {
    return this.request<PaginatedResponse<T>>(`/${resource}${this.buildQuery(params)}`);
  }

  async listAllResource<T>(resource: string): Promise<ListAllResponse<T>> {
    return this.request<ListAllResponse<T>>(`/${resource}/all`);
  }

  async getResource<T>(resource: string, id: string): Promise<SingleResponse<T>> {
    return this.request<SingleResponse<T>>(`/${resource}/${id}`);
  }

  async createResource<T, D = any>(resource: string, data: D): Promise<SingleResponse<T>> {
    return this.request<SingleResponse<T>>(`/${resource}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateResource<T, D = any>(resource: string, id: string, data: D): Promise<SingleResponse<T>> {
    return this.request<SingleResponse<T>>(`/${resource}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteResource<T = any>(resource: string, id: string): Promise<DeleteResponse & T> {
    return this.request<DeleteResponse & T>(`/${resource}/${id}`, {
      method: "DELETE",
    });
  }

  async bulkCreateResource<T, D = any>(resource: string, data: D[]): Promise<ListAllResponse<T>> {
    return this.request<ListAllResponse<T>>(`/${resource}/bulk`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async bulkUpdateResource<T, D = any>(
    resource: string, 
    data: { id: string; data: D }[]
  ): Promise<ListAllResponse<T>> {
    return this.request<ListAllResponse<T>>(`/${resource}/bulk`, {
      method: "PUT",
      body: JSON.stringify({ updates: data }), // Follows API bulk update schema convention
    });
  }

  async bulkDeleteResource(resource: string, ids: string[]): Promise<BulkDeleteResponse> {
    return this.request<BulkDeleteResponse>(`/${resource}/bulk`, {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  }

  async changeStatus(resource: string, ids: string[], status: string): Promise<{ success: boolean; updatedCount: number }> {
    return this.request<{ success: boolean; updatedCount: number }>(`/${resource}/status`, {
      method: "PUT",
      body: JSON.stringify({ ids, status }),
    });
  }

  async reorderResource(resource: string, updates: { id: string; order: number }[]): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/${resource}/reorder`, {
      method: "PUT",
      body: JSON.stringify({ updates }),
    });
  }

  // Auth
  async signIn(email: string, password: string): Promise<AuthSession> {
    return this.request<AuthSession>("/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signUp(
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: User }> {
    return this.request<{ user: User }>("/auth/sign-up/email", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async signOut(): Promise<void> {
    await this.request("/auth/sign-out", { method: "POST" });
  }

  async getSession(): Promise<AuthSession | null> {
    const res = await this.request<AuthSession | null>("/auth/get-session");
    return res;
  }

  // Users (admin)
  async listUsers(): Promise<{ users: User[] }> {
    return this.request<{ users: User[] }>("/auth/admin/list-users");
  }

  async setUserRole(
    userId: string,
    role: string,
  ): Promise<{ user: User }> {
    return this.request<{ user: User }>("/auth/admin/set-role", {
      method: "POST",
      body: JSON.stringify({ userId, role }),
    });
  }

  // RBAC
  async getMyPermissions(): Promise<MePermissionsResponse> {
    return this.request<MePermissionsResponse>("/rbac/me/permissions");
  }

  // Roles
  async listRoles(params?: ListParams): Promise<PaginatedResponse<Role>> {
    return this.request<PaginatedResponse<Role>>(
      `/roles${this.buildQuery(params)}`,
    );
  }

  async listAllRoles(): Promise<ListAllResponse<Role>> {
    return this.request<ListAllResponse<Role>>("/roles/all");
  }

  async getRole(id: string): Promise<SingleResponse<RoleExpanded>> {
    return this.request<SingleResponse<RoleExpanded>>(`/roles/${id}`);
  }

  async createRole(
    data: { name: string; description?: string; permissions?: string[] },
  ): Promise<SingleResponse<Role>> {
    return this.request<SingleResponse<Role>>("/roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRole(
    id: string,
    data: { name?: string; description?: string; permissions?: string[] },
  ): Promise<SingleResponse<Role>> {
    return this.request<SingleResponse<Role>>(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string): Promise<DeleteResponse> {
    return this.request<DeleteResponse>(`/roles/${id}`, {
      method: "DELETE",
    });
  }

  async bulkDeleteRoles(ids: string[]): Promise<BulkDeleteResponse> {
    return this.request<BulkDeleteResponse>("/roles/bulk", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  }

  // Permissions
  async listPermissions(
    params?: ListParams,
  ): Promise<PaginatedResponse<Permission>> {
    return this.request<PaginatedResponse<Permission>>(
      `/permissions${this.buildQuery(params)}`,
    );
  }

  async listAllPermissions(): Promise<ListAllResponse<Permission>> {
    return this.request<ListAllResponse<Permission>>("/permissions/all");
  }

  async getPermission(id: string): Promise<SingleResponse<Permission>> {
    return this.request<SingleResponse<Permission>>(`/permissions/${id}`);
  }

  async createPermission(
    data: { name: string; description?: string; groupName?: string },
  ): Promise<SingleResponse<Permission>> {
    return this.request<SingleResponse<Permission>>("/permissions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePermission(
    id: string,
    data: { name?: string; description?: string; groupName?: string },
  ): Promise<SingleResponse<Permission>> {
    return this.request<SingleResponse<Permission>>(`/permissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePermission(id: string): Promise<DeleteResponse> {
    return this.request<DeleteResponse>(`/permissions/${id}`, {
      method: "DELETE",
    });
  }

  // Assets
  async listAssets(
    resourceType: string,
    resourceId: string,
  ): Promise<{ data: Asset[] }> {
    return this.request<{ data: Asset[] }>(
      `/${resourceType}/${resourceId}/assets`,
    );
  }

  async uploadAsset(
    resourceType: string,
    resourceId: string,
    file: File,
  ): Promise<{ data: Asset }> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<{ data: Asset }>(
      `/${resourceType}/${resourceId}/assets`,
      { method: "POST", body: formData },
    );
  }

  async deleteAsset(
    resourceType: string,
    resourceId: string,
    assetId: string,
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      `/${resourceType}/${resourceId}/assets/${assetId}`,
      { method: "DELETE" },
    );
  }

  async deleteAllAssets(
    resourceType: string,
    resourceId: string,
  ): Promise<{ removedCount: number }> {
    return this.request<{ removedCount: number }>(
      `/${resourceType}/${resourceId}/assets`,
      { method: "DELETE" },
    );
  }
}

export class ApiError extends Error {
  status: number;

  constructor(
    status: number,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const api = new ApiClient();
