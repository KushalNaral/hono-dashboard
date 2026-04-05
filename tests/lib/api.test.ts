import { describe, it, expect, vi, beforeEach } from "vitest";
import { api, ApiError } from "@/lib/api";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(body),
    headers: new Headers(),
  } as unknown as Response;
}

describe("ApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signIn sends correct request", async () => {
    const sessionData = { user: { id: "1" }, session: { id: "s1" } };
    mockFetch.mockResolvedValue(jsonResponse(sessionData));

    const result = await api.signIn("test@test.com", "pass123");

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/sign-in/email");
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    expect(JSON.parse(options.body as string)).toEqual({
      email: "test@test.com",
      password: "pass123",
    });
    expect(result).toEqual(sessionData);
  });

  it("listRoles builds query string", async () => {
    const data = { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
    mockFetch.mockResolvedValue(jsonResponse(data));

    await api.listRoles({ page: 2, pageSize: 10, sortBy: "name", sortDir: "desc" });

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain("page=2");
    expect(url).toContain("pageSize=10");
    expect(url).toContain("sortBy=name");
    expect(url).toContain("sortDir=desc");
  });

  it("throws ApiError on non-ok responses", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ error: "Not found" }, 404));

    await expect(api.getRole("bad-id")).rejects.toThrow(ApiError);
    await expect(api.getRole("bad-id")).rejects.toThrow("Not found");
  });

  it("ApiError contains status code", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ error: "Forbidden" }, 403));

    try {
      await api.deleteRole("some-id");
      expect.unreachable("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(403);
    }
  });

  it("uploadAsset sends FormData", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ data: { id: "a1" } }));

    const file = new File(["test"], "test.png", { type: "image/png" });
    await api.uploadAsset("roles", "r1", file);

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/roles/r1/assets");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
  });

  it("signOut sends POST request", async () => {
    mockFetch.mockResolvedValue(jsonResponse({}));

    await api.signOut();

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/sign-out");
    expect(options.method).toBe("POST");
  });

  it("listAllPermissions calls correct endpoint", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ data: [] }));

    await api.listAllPermissions();

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toBe("/api/permissions/all");
  });
});
