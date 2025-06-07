# Tên Dự án: Quiz Learn - Học & Kiểm tra

Dự án này nhằm mục đích phát triển một ứng dụng web trắc nghiệm tương tác (Quiz Web App) tương tự như Quizizz, Kahoot. Ứng dụng sẽ được xây dựng bằng SvelteKit, cho phép người dùng tạo, quản lý và tham gia các bài quiz.

### 📋 Danh sách thành viên nhóm

| STT | Họ và tên        | Mã sinh viên | username      |
| --- | ---------------- | ------------ | ------------- |
| 1   | Trần Thành Long  | 23010070     | nielpattin    |
| 2   | Vương Quang Quý  | 23010039     | akitosuref    |
| 3   | Nguyễn Xuân Mạnh | 23010045     | xuanmanh-2110 |
| 4   | Vũ Văn Sơn       | 23010060     | sunyn582      |

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
pnpm db:generate       # Generate sql files from Drizzle schema
pnpm db:migrate        # Run database migrations from sql files to PostgreSQL Database

# Development
pnpm dev --open        # Start dev server

# Formatting and linting
pnpm check:watch       # Type checking
pnpm format            # Format code
pnpm lint              # Lint code

# Database
pnpm db:studio         # Open Drizzle Studio
```

## Development Tech

- FrameworkL: SvelteKit(TypeScript)
- Package Manager: pnpm
- Database: PostgreSQL with Drizzle ORM
- Authentication: Auth.js with Google OAuth Provider, Github OAuth Provider
- Deployment: Docker via Coolify
- Styling: CSS thuần hoặc TailwindCSS
- Lint and Format:
  - ESLint
  - Prettier
  - Husky
  - Commitlint
  - Lint-Staged
