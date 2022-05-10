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

`cd \@summer-js/summer-test/` and run `npm run dev` to start

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

### Add new feature to core

Modify code in @summer-js/summer

### Develop a new plugin

1. Add a new package to workspace
   `npm init -w ./@summer-js/packagename`

2. Add index.ts

Example:

```
class PluginName implements SummerPlugin {
    configKey: "CONFIG_KEY"

    // optional
    compile(clazz: ClassDeclaration) {
       // code implement during compiling
       // compiler will go through all classes
    }

    // optional
    postCompile() {
       // code implement after compile
    }
    autoImportDecorators() {
       // auto-import Decorator
       return ["DecoratorName"]
    };
    init(config: any) {
       // code implement when server start
    };

    // optional
    destroy(){
       // code implement when server destroyed
    };
}

```
