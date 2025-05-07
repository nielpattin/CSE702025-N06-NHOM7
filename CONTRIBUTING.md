# How to Contribute to this repository

## Fork the repository

1. Click the "Fork" button in the top right corner of the repository page on GitHub.
2. This will create a copy of the repository in your own GitHub account.
3. Clone the forked repository to your local machine using the command:
   ```bash
   git clone https://github.com/your_username/cse702025-nhom7.git
   ```
4. Navigate to the cloned repository:
   ```bash
   cd cse702025-nhom7
   ```
5. Add the original repository as a remote to keep your fork up to date:
   ```bash
   git remote add upstream https://github.com/original-owner/repository-name.git
   ```
6. Fetch the changes from the original repository:
   ```bash
   git fetch upstream
   ```
7. Merge the changes into your local branch:
   ```bash
    git merge upstream/main
   ```
8. Push the changes to your forked repository:
   ```bash
   git push origin main
   ```
9. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
