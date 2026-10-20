import { request } from "../http"
import { apiPath } from "../endpoints"
import type { QueryParams } from "../types"

export const getGeneralLedger = (params: QueryParams = {}, signal?: AbortSignal) =>
  request<unknown>({
    url: apiPath.reporting.generalLedger,
    method: "GET",
    params,
    signal,
  })

export const getGeneralLedgerSummary = (params: QueryParams = {}, signal?: AbortSignal) =>
  request<unknown>({
    url: apiPath.reporting.generalLedgerSummary,
    method: "GET",
    params,
    signal,
  })
