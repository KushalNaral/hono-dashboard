import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";

vi.mock("@/lib/api", () => {
  const mockApi = {
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    getMyPermissions: vi.fn(),
  };
  return { api: mockApi, ApiError: class extends Error { status: number; constructor(s: number, m: string) { super(m); this.status = s; } } };
});

import { api } from "@/lib/api";

const mockApi = api as unknown as {
  signIn: ReturnType<typeof vi.fn>;
  signUp: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
  getMyPermissions: ReturnType<typeof vi.fn>;
};

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("starts unauthenticated", () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(store.loading).toBe(true);
  });

  it("signIn updates user state", async () => {
    const user = { id: "1", name: "Test", email: "test@test.com", role: "admin" };
    mockApi.signIn.mockResolvedValue({ user, session: { id: "s1" } });
    mockApi.getMyPermissions.mockResolvedValue({ role: "admin", permissions: ["list-users"] });

    const store = useAuthStore();
    await store.signIn("test@test.com", "pass");

    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.name).toBe("Test");
    expect(store.isAdmin).toBe(true);
    expect(store.userPermissions).toEqual(["list-users"]);
  });

  it("signOut clears state", async () => {
    const user = { id: "1", name: "Test", email: "test@test.com", role: "user" };
    mockApi.signIn.mockResolvedValue({ user, session: { id: "s1" } });
    mockApi.getMyPermissions.mockResolvedValue({ role: "user", permissions: [] });
    mockApi.signOut.mockResolvedValue(undefined);

    const store = useAuthStore();
    await store.signIn("test@test.com", "pass");
    expect(store.isAuthenticated).toBe(true);

    await store.signOut();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
  });

  it("fetchSession sets user from session endpoint", async () => {
    const user = { id: "1", name: "Test", email: "test@test.com", role: "moderator" };
    mockApi.getSession.mockResolvedValue({ user, session: { id: "s1" } });
    mockApi.getMyPermissions.mockResolvedValue({ role: "moderator", permissions: ["list-users", "view-users"] });

    const store = useAuthStore();
    await store.fetchSession();

    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.role).toBe("moderator");
    expect(store.loading).toBe(false);
    expect(store.hasPermission("list-users")).toBe(true);
    expect(store.hasPermission("delete-users")).toBe(false);
  });

  it("fetchSession handles failure gracefully", async () => {
    mockApi.getSession.mockRejectedValue(new Error("Unauthorized"));

    const store = useAuthStore();
    await store.fetchSession();

    expect(store.isAuthenticated).toBe(false);
    expect(store.loading).toBe(false);
  });

  it("hasPermission returns correct values", async () => {
    const user = { id: "1", name: "Test", email: "test@test.com", role: "admin" };
    mockApi.signIn.mockResolvedValue({ user, session: { id: "s1" } });
    mockApi.getMyPermissions.mockResolvedValue({
      role: "admin",
      permissions: ["list-users", "view-roles", "create-roles"],
    });

    const store = useAuthStore();
    await store.signIn("test@test.com", "pass");

    expect(store.hasPermission("list-users")).toBe(true);
    expect(store.hasPermission("view-roles")).toBe(true);
    expect(store.hasPermission("ban-users")).toBe(false);
  });
});
