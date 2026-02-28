/**
 * Centralized API client for backend calls.
 * Uses NEXT_PUBLIC_API_URL and sends Bearer token from localStorage when present.
 */

const ACCESS_TOKEN_KEY = "access_token";

/** API version prefix; must match backend (e.g. FastAPI prefix="/api/v1"). */
const API_PREFIX = "/api/v1";

function getBaseUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return "";
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: string | Record<string, unknown>;
}

export async function request<T = unknown>(
  path: string,
  options: RequestInit & { params?: Record<string, string | number | boolean> } = {}
): Promise<{ data: T; ok: true } | { ok: false; error: ApiError }> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return {
      ok: false,
      error: { status: 0, message: "Client misconfigured: missing NEXT_PUBLIC_API_URL." },
    };
  }

  const { params, ...fetchOptions } = options;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let url = `${baseUrl}${API_PREFIX}${normalizedPath}`;
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => search.set(k, String(v)));
    url += `?${search.toString()}`;
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers: {
      ...getAuthHeaders(),
      ...(fetchOptions.headers as Record<string, string>),
    },
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    let body: unknown = null;
    if (isJson) {
      try {
        body = await response.json();
      } catch {
        body = null;
      }
    }

    if (!response.ok) {
      const message =
        (body && typeof body === "object" && "detail" in body && typeof (body as { detail: unknown }).detail === "string")
          ? (body as { detail: string }).detail
          : response.statusText || "Request failed";
      return {
        ok: false,
        error: {
          status: response.status,
          message,
          detail: body && typeof body === "object" ? (body as Record<string, unknown>) : undefined,
        },
      };
    }

    return { ok: true, data: body as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network or request failed";
    return {
      ok: false,
      error: { status: 0, message },
    };
  }
}

/** GET request */
export function get<T = unknown>(path: string, params?: Record<string, string | number | boolean>) {
  return request<T>(path, { method: "GET", params });
}

/** POST request. Pass body as second argument. */
export function post<T = unknown>(path: string, body?: unknown) {
  return request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined });
}

/** PUT request. Pass body as second argument. */
export function put<T = unknown>(path: string, body?: unknown) {
  return request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined });
}

/** PATCH request. Pass body as second argument. */
export function patch<T = unknown>(path: string, body?: unknown) {
  return request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined });
}

/** DELETE request */
export function del<T = unknown>(path: string) {
  return request<T>(path, { method: "DELETE" });
}

// --- User types (match backend schemas) ---

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  status: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserCreateBody {
  name: string;
  email: string;
  password: string;
  status?: number;
}

export interface UserUpdateBody {
  name?: string;
  email?: string;
  password?: string;
  status?: number;
}

// --- User API ---

export const users = {
  /** POST /users/login — returns JWT */
  login: (email: string, password: string) =>
    post<LoginResponse>("/users/login", { email, password }),

  /** POST /users/ — register (no auth) */
  create: (body: UserCreateBody) =>
    post<UserResponse>("/users/", body),

  /** GET /users/me — current user (auth required) */
  getMe: () =>
    get<UserResponse>("/users/me"),

  /** GET /users/ — list users (auth required). Optional status_filter: 1=active, 0=inactive */
  getAll: (params?: { status_filter?: number }) =>
    get<UserResponse[]>("/users/", params as Record<string, number>),

  /** GET /users/:id — get user by id (auth required) */
  getById: (userId: number) =>
    get<UserResponse>(`/users/${userId}`),

  /** PUT /users/:id — update user (auth required, own user only) */
  update: (userId: number, body: UserUpdateBody) =>
    put<UserResponse>(`/users/${userId}`, body),
};

/** Token key for localStorage; use when saving/reading token outside this module */
export { ACCESS_TOKEN_KEY };
