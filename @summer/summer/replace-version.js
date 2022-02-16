const fs = require('fs');
const packageInfo = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf-8' }));
const summerJs = fs.readFileSync('./lib/summer.js', { encoding: 'utf-8' });
fs.writeFileSync('./lib/summer.js', summerJs.replace('$$SUMMER_VERSION', packageInfo.version));
