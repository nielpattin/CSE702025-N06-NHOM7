### 📋 Danh sách thành viên nhóm

| STT | Họ và tên        | Mã sinh viên | github username |
| --- | ---------------- | ------------ | --------------- |
| 1   | Trần Thành Long  | 23010070     | nielpattin      |
| 2   | Vương Quang Quý  | 23010039     | akitosuref      |
| 3   | Nguyễn Xuân Mạnh | 23010045     | xuanmanh-2110   |
| 4   | Vũ Văn Sơn       | 23010060     | sunyn582        |

## Developing

### Setup Environment

- Copy the `.env.example` file to `.env` and set the environment variables.
- Make sure you have the following installed:
  - [Node.js](https://nodejs.org/en/download/) (latest LTS version)
  - [pnpm](https://pnpm.io/installation#using-corepack) (latest version)
  - [Docker](https://www.docker.com/get-started) (for PostgreSQL)

### 🔧 Development Commands

```bash
# Setup
pnpm install
pnpm db:start          # Start PostgreSQL container
pnpm db:push           # Push schema changes

# Development
pnpm dev --open        # Start dev server
pnpm check:watch       # Type checking
pnpm format            # Format code
pnpm lint              # Lint code

# Database
pnpm db:studio         # Open Drizzle Studio
```

## Development Tech

- SvelteKit
- TypeScript
- pnpm
- PostgreSQL
- Eslint
- Prettier
- Husky
- Commitlint
- Lint-Staged
- TailwindCSS
