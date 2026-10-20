import { request } from "../http"
import { apiPath } from "../endpoints"
import type { QueryParams } from "../types"

export const getInquiryAccount = (params: QueryParams = {}, signal?: AbortSignal) =>
  request<unknown>({
    url: apiPath.account.inquiry,
    method: "GET",
    params,
    signal,
  })

export const getAccountById = (id: string | number) =>
  request<unknown>({
    url: apiPath.account.detail(id),
    method: "GET",
  })
