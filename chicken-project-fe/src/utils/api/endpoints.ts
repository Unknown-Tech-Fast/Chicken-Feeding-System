export const apiPath = {
  chicken: {
    list: "chicken/transactions",
    detail: (id: string | number) => `chicken/transactions/${id}`,
    create: "chicken/transactions",
  },
  account: {
    inquiry: "accounts/inquiry",
    detail: (id: string | number) => `accounts/${id}`,
  },
  reporting: {
    generalLedger: "reporting/general-ledger",
    generalLedgerSummary: "reporting/general-ledger/summary",
  },
  auth: {
    login: "auth/login",
    refresh: "auth/refresh",
    profile: "auth/me",
  },
} as const
