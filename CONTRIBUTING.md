
## Contributing Guide

Hi! We are really excited that you are interested in contributing to <b>summer</b>. Before submitting your contribution, please make sure to take a moment and read through the following guide:

### Ready to start

We welcome everyone to join the construction of the project.
As a pre requirement, you need have a preliminary understanding of `NodeJS`, if you don't know `NodeJS`
this is a good [learn document for NodeJS](https://nodejs.org/en/docs).
And you can refer to [GitHub's help documentation](https://help.github.com/en/github/using-git) if you don't know the basic operation of Git


This project maintains monorepo by npm v8 workspace

To develop and test the core packages:

1. [Fork this repository](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) to your own account and then clone it.
2. Create a new branch for your changes: `git checkout -b {BRANCH_NAME}`.
3. Run `npm i -ws` in the root folder to install all dependencies.
4. cd `@summer-js/summer-test/` and run `npm run serve` to start

**Create Feature**

1. Get into `@summer-js/summer`.
2. Coding...
3. Running `npm run build`.
4. Get into `@summer-js/summer-test/`.
5. Coding...
6. Running `npm run serve`.

**Create testcase**

1. If you are creating a new Characteristics, the testcase is required.
2. If you only fix some bug, please note update test case.
3. Please into `@summer-js/summer-test/` & Running `npm run test` before submit.

### Q & A

> How can I update remote origin ?

- refer to [here](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes).

> How to choose the target branch of PR ?

- Make sure PRs are make sure to `dev` branch.


### Get stuck

- Create new issue to tell us: [create issue](https://github.com/calidan-x/summer/issues).