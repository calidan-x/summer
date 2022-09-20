#!/usr/bin/env node

// @ts-check
const fs = require('fs')
const path = require('path')
const prompts = require('prompts')

const copyRecursiveSync = function (src, dest) {
  const exists = fs.existsSync(src)
  const isDirectory = exists && fs.statSync(src).isDirectory()
  if (isDirectory) {
    fs.mkdirSync(dest)
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

;(async () => {
  let response = await prompts({
    type: 'text',
    name: 'value',
    message: 'Project Name:',
    validate: (value) => (!value ? 'Please enter a name' : true)
  })

  const projectName = response.value
  if (!projectName) {
    return
  }

  response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Pick a template',
    choices: [
      { title: 'Empty Project', value: 'empty' },
      {
        title: 'Rest API Project',
        description: 'A movie rest api project with TypeORM and Swagger',
        value: 'movie'
      }
    ],
    initial: 0
  })
  const templateName = response.value

  if (fs.existsSync(projectName)) {
    console.log(projectName + ' exists, exit')
    return
  }

  copyRecursiveSync(path.join(__dirname, `templates/${templateName}`), projectName)

  fs.writeFileSync(projectName + '/.gitignore', ['.DS_Store', 'node_modules', 'build', 'compile'].join('\n'))
  const packageJson = JSON.parse(fs.readFileSync(projectName + '/package.json', { encoding: 'utf8' }))
  packageJson.name = projectName
  fs.writeFileSync(projectName + '/package.json', JSON.stringify(packageJson, null, 4))

  console.log('Project Created! Now run:')
  console.log('')
  console.log(`$ cd ${projectName}`)
  console.log(`$ npm install`)
  console.log(`$ npm run serve`)
  console.log('')
})()
