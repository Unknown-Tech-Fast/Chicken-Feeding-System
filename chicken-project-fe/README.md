# chicken-project-fe

Frontend Chicken Project — React 19 + Vite + Tailwind v4 + shadcn/ui, dalam satu app (bukan monorepo).

## Menjalankan

```bash
pnpm install
cp .env.example .env.local   # isi VITE_API_URL ke backend .NET
pnpm dev
```

Script lain: `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format`, `pnpm preview`.

## Struktur

```
src/
├── components/
│   ├── ui/              # komponen shadcn/ui (button, table, dialog, ...)
│   ├── app-layout.tsx   # shell layout + sidebar
│   ├── toaster.tsx      # <Toaster /> global (sonner)
│   └── theme-provider.tsx
├── hooks/               # useIsMobile
├── lib/utils.ts         # re-export cn
├── pages/               # halaman per menu
├── styles/globals.css   # token desain + Tailwind
├── utils/api/           # layer API (lihat index-usage.md)
├── routes.ts            # path + title + description per halaman
└── routes-sidebar.ts    # struktur menu sidebar
```

## Menambah komponen shadcn

Jalankan dari root project:

```bash
pnpm dlx shadcn@latest add button
```

Komponen masuk ke `src/components/ui/`, diatur lewat `components.json` (alias `@/components/ui`).

## Memakai komponen

```tsx
import { Button } from "@/components/ui/button"
```

## Layer API

Semua request lewat `src/utils/api`. Contoh:

```tsx
import { getTransaksiAyam } from "@/utils/api"
```

Detail lengkap ada di [`src/utils/api/index-usage.md`](src/utils/api/index-usage.md).

## Catatan konfigurasi

- `pnpm-workspace.yaml` **bukan** monorepo — hanya tempat setting pnpm (`allowBuilds`).
- `eslint.config.js` memakai `projectService`, jadi butuh `tsconfigRootDir` yang di-set ke root project ini.
