# SvelteKit + TypeScript + pnpm + PostgreSQL + Eslint + Prettier + Husky + Commitlint + Lint-Staged

## Developing

### 📋 Danh sách thành viên nhóm

| STT | Họ và tên        | Mã sinh viên | Chức vụ     |
|-----|------------------|--------------|-------------|
| 1   | Trần Thành Long  | 23010070     | Nhóm trưởng |
| 2   | Vương Quang Quý  | 23010039     | Thành viên  |
| 3   | Nguyễn Xuân Mạnh | 23010045     | Thành viên  |
| 4   | Vũ văn Sơn       | 23010060     | Thành viên  |


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

## SvelteKit Checking (Optional)

```bash
# Check the SvelteKit app for errors
pnpm check:watch
```

## Contributing

- Please make sure to follow the [contribution guidelines](CONTRIBUTING.md).
  <!-- - Please make sure to follow the [code style guidelines](CODE_STYLE.md). -->
  <!-- - Please make sure to follow the [commit message guidelines](COMMIT_MESSAGE.md). -->
  <!-- - Please make sure to follow the [branch naming guidelines](BRANCH_NAMING.md). -->
  <!-- - Please make sure to follow the [pull request guidelines](PULL_REQUEST.md). -->
  <!-- - Please make sure to follow the [issue guidelines](ISSUE_TEMPLATE.md). -->
  <!-- - Please make sure to follow the [release guidelines](RELEASE.md). -->
  <!-- - Please make sure to follow the [versioning guidelines](VERSIONING.md). -->
  <!-- - Please make sure to follow the [testing guidelines](TESTING.md). -->
  <!-- - Please make sure to follow the [deployment guidelines](DEPLOYMENT.md). -->
  <!-- - Please make sure to follow the [localization guidelines](LOCALIZATION.md). -->
  <!-- - Please make sure to follow the [documentation guidelines](DOCUMENTATION.md). -->
  <!-- - Please make sure to follow the [design guidelines](DESIGN.md). -->
