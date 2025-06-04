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

### Install dependencies

```bash
# Install package, setup husky, .svelte-kit folder
pnpm install
```

### Run the database docker container (REQUIRED INSTALL DOCKER)

```bash
# Start the database container
pnpm db:start

# push the database schema (create tables, etc.) for the database
# make sure to keep the database container running
pnpm db:push

```

### Run the SvelteKit app

```bash
# Start the server and open the app in a new browser tab(automatically)
pnpm dev --open
```

### SvelteKit Checking (Optional)

```bash
# Check the SvelteKit app for errors
pnpm check:watch
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
