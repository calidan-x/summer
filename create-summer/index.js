#!/usr/bin/env node

// @ts-check
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

var copyRecursiveSync = function (src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

(async () => {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: 'Project Name:',
    validate: (value) => (!value ? 'project name is empty' : true)
  });

  const projectName = response.value;
  copyRecursiveSync(path.join(__dirname, 'template-empty'), projectName);

  console.log('Project Created! Now run:');
  console.log('');
  console.log(`$ cd ${projectName}`);
  console.log(`$ npm i`);
  console.log(`$ npm run dev`);
  console.log('');
})();
