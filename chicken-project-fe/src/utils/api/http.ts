import axios, { AxiosError, type AxiosRequestConfig } from "axios"

import {
  API_BASE_URL,
  API_TIMEOUT_MS,
  SKIP_AUTH_PATHS,
  STORAGE_KEYS,
} from "./config"

type Handler = (reason?: unknown) => void
let sessionExpiredHandler: Handler | null = null

export const setSessionExpiredHandler = (handler: Handler | null) => {
  sessionExpiredHandler = handler
}

const notifySessionExpired = (reason?: unknown) => {
  sessionExpiredHandler?.(reason)
}

export const tokenStorage = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEYS.token)),
  set: (token: string) => localStorage.setItem(STORAGE_KEYS.token, token),
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem(STORAGE_KEYS.refreshToken)
  },
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
})

const isPublicPath = (url = "") => SKIP_AUTH_PATHS.some((path) => url.includes(path))

axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`

  const offsetInMinutes = new Date().getTimezoneOffset()
  const abs = Math.abs(offsetInMinutes)
  const sign = offsetInMinutes <= 0 ? "+" : "-"
  config.headers["X-Client-Timezone"] =
    `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`

  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    const rotated = response.headers["x-new-token"]
    if (typeof rotated === "string" && rotated.length > 0) tokenStorage.set(rotated)
    return response
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 && !isPublicPath(error.config?.url)) {
      notifySessionExpired(error)
    }
    return Promise.reject(error)
  },
)

export type ApiResult<T> = {
  data: T
  message: string
  success: boolean
}

type RequestOptions = AxiosRequestConfig & {
  service?: string
}

const extractMessage = (error: AxiosError): string => {
  const payload = error.response?.data as Record<string, unknown> | undefined
  if (payload) {
    if (payload.errors && typeof payload.errors === "object") {
      const first = Object.values(payload.errors as Record<string, unknown>)[0]
      if (Array.isArray(first) && typeof first[0] === "string") return first[0]
    }
    const candidates = [payload.message, payload.detail, payload.title, payload.error]
    const found = candidates.find((value) => typeof value === "string" && value.trim().length > 0)
    if (typeof found === "string") return found
  }
  return error.response?.statusText || error.message || "Terjadi kesalahan tak terduga"
}

const statusLabel: Record<number, string> = {
  400: "Permintaan tidak valid",
  401: "Sesi berakhir, silakan login kembali",
  403: "Akses ditolak",
  404: "Data tidak ditemukan",
  422: "Data tidak dapat diproses",
  500: "Internal Server Error",
}

const toastError = async (message: string) => {
  const { toast } = await import("sonner")
  toast.error(message)
}

export const request = async <T = unknown>(
  options: RequestOptions,
  config?: { silent?: boolean },
): Promise<T> => {
  const { service = "", ...rest } = options

  try {
    const response = await axiosInstance<T>({ ...rest, url: `${service}${rest.url ?? ""}` })
    return response.data
  } catch (error) {
    if (axios.isCancel(error)) throw error

    if (!config?.silent) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          await toastError("Request timeout, coba lagi")
        } else if (error.response) {
          const status = error.response.status
          const label = statusLabel[status] ?? "Error"
          await toastError(`${status} - ${label} : ${extractMessage(error)}`)
        } else if (error.message.includes("Network Error")) {
          await toastError("Tidak dapat terhubung ke server (cek koneksi / CORS)")
        } else {
          await toastError(error.message)
        }
      } else {
        await toastError(error instanceof Error ? error.message : String(error))
      }
    }

    throw error
  }
}

export default axiosInstance
