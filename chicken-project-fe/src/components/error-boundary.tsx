import { Component, type ReactNode } from "react"

type Props = {
  children: ReactNode
  catchGlobalErrors?: boolean
}

type State = {
  error: Error | null
}

function toError(value: unknown): Error {
  if (value instanceof Error) return value

  return new Error(
    typeof value === "string" ? value : "Kesalahan JavaScript tanpa pesan error."
  )
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { error: toError(error) }
  }

  private handleError = (event: ErrorEvent) => {
    if (!event.message) return
    this.setState({ error: toError(event.error ?? event.message) })
  }

  private handleRejection = (event: PromiseRejectionEvent) => {
    this.setState({ error: toError(event.reason) })
  }

  componentDidMount() {
    if (!this.props.catchGlobalErrors) return

    window.addEventListener("error", this.handleError)
    window.addEventListener("unhandledrejection", this.handleRejection)
  }

  componentWillUnmount() {
    if (!this.props.catchGlobalErrors) return

    window.removeEventListener("error", this.handleError)
    window.removeEventListener("unhandledrejection", this.handleRejection)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <section
        role="alert"
        aria-labelledby="app-error-title"
        className="mx-auto my-8 w-full max-w-2xl rounded-xl border bg-card p-5 text-card-foreground sm:p-7"
      >
        <h1 id="app-error-title" className="text-xl font-semibold tracking-tight">
          Terjadi kesalahan pada aplikasi
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Halaman ini tidak dapat dilanjutkan. Muat ulang untuk mencoba kembali.
          Perubahan yang belum disimpan mungkin hilang.
        </p>
        <pre className="mt-5 overflow-auto rounded-lg border bg-muted p-4 text-sm leading-6 whitespace-pre-wrap break-words">
          {error.name}: {error.message}
        </pre>
        {error.stack && (
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer rounded-md font-medium focus-visible:outline-2 focus-visible:outline-ring">
              Detail teknis
            </summary>
            <pre className="mt-3 max-h-72 overflow-auto rounded-lg border bg-muted p-4 text-xs leading-6 whitespace-pre-wrap break-words">
              {error.stack}
            </pre>
          </details>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full border border-primary px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
        >
          Muat ulang halaman
        </button>
      </section>
    )
  }
}
