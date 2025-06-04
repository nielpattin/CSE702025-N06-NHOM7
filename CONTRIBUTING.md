# How to Contribute to this repository

## Fork the repository

1. Click the "Fork" button in the top right corner of the repository page on GitHub.
2. This will create a copy of the repository in your own GitHub account.
3. Clone the forked repository to your local machine using the command:

```bash
git clone https://github.com/nielpattin/CSE702025-N06-NHOM7.git
```

```bash
git remote add upstream https://github.com/nielpattin/CSE702025-N06-NHOM7.git
git fetch upstream
git branch -a # to check the branches
```

5. Create a new branch for your changes:

- Most use: feat, fix, or chore

```bash
git checkout -b feat/your-feature-name
```

6. Make your changes in the codebase. Be sure to follow the coding style and conventions used in the project.

7. Push the changes to your forked repository(origin):

```bash
git push
```

9. Go to your forked repository on GitHub.
10. Click on the "Compare & pull request" button.
11. Add a title and description for your pull request.
12. Address any feedback or changes requested by the maintainers.

13. AFTER your pull request is approved.

```bash
# Delete the branch local and remote
git checkout main
git branch -d feat/your-feature-name
git push -d origin feat/your-feature-name
```

## Some Case

- When working on a new feature that you create from main branch, sometimes you may need to update your branch with the latest changes from the main branch. You can do this by running the following commands:

- When you done with your feature and want to push it to the forked repository. But when creating the pull request, it say your branch can't be merged automatically
- This happens when the main branch(upstream) has changes that are not in your branch. To fix this, you need to merge the main branch into your branch. You can do this by running the following commands:

```bash
git checkout feat/your-feature-name
git fetch --all
git rebase upstream/main
```

- An then start fixing the merge conflicts. After that, you can push the changes to your forked repository:
