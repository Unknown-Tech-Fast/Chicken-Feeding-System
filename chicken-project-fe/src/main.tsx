import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "@/styles/globals.css"
import { App } from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "@/components/toaster.tsx"
import { ErrorBoundary } from "@/components/error-boundary"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary catchGlobalErrors>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light">
          <App />
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
