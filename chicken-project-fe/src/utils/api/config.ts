
const withTrailingSlash = (url: string) => (url.endsWith("/") ? url : `${url}/`)

export const API_BASE_URL = withTrailingSlash(import.meta.env.VITE_API_URL ?? "/api/")

export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT ?? 30_000)

export const STORAGE_KEYS = {
  token: "access_token",
  refreshToken: "refresh_token",
} as const

export const SKIP_AUTH_PATHS = ["auth/login", "auth/refresh", "auth/register"] as const
