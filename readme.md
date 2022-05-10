# 🔆 Summer

Efficient NodeJs Backend Framework

Please visit [https://summerjs.dev](https://summerjs.dev) for more detail

## Prerequisite

- Node 14+
- NPM 8+

You can use [nvm](https://github.com/nvm-sh/nvm) to install node which will install specific nodejs version defined in `.nvmrc`.

- `nvm use`

### How to develop

This project maintain monorepo by npm v8 workspace

run `npm i -ws` to install all dependencies

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
