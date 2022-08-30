![](https://raw.githubusercontent.com/calidan-x/summer/main/assets/summer-logo.png)

Efficient NodeJs Backend Framework

Please visit [https://summerjs.dev](https://summerjs.dev) for more detail

## Prerequisite

- Node 16+
- NPM 8+

### How to develop

This project maintains monorepo by npm v8 workspace

run `npm i -ws` to install all dependencies

`cd \@summer-js/summer-test/` and run `npm run serve` to start

### Packages

There are 7 npm projects in this repo

1. **create-summer**

   project create command `npm create summer`

2. **@summer-js/cli**

   compiler and local dev server

3. **@summer-js/summer**

   core code

4. **@summer-js/summer-test** (not publish to npmjs)

   test project for testing summer core code

5. **@summer-js/swagger**

   swagger plugin

6. **@summer-js/test**

   project testing library

7. **@summer-js/typeorm**

   typeorm plugin

### Git commit message examples

- feat: add new feature
- fix: fix bug
- docs: update docs
- refactor: refactor code
- test: add test case

### Develop core code

Add / Modify code in @summer-js/summer
