const fs = require('fs')

const packageFiles = [
  './package.json',
  './@summer-js/cli/package.json',
  './@summer-js/summer/package.json',
  './@summer-js/summer-test/package.json',
  './@summer-js/swagger/package.json',
  './@summer-js/test/package.json',
  './@summer-js/typeorm/package.json'
]

const templateFiles = ['./create-summer/templates/empty/package.json', './create-summer/templates/movie/package.json']

const newVersion = process.argv[2]

if (!newVersion) {
  console.error('Error: Missing Version')
  process.exit()
}

if (newVersion.split('.').length !== 3) {
  console.error('Error: Version must like 1.0.0')
  process.exit()
}

const createSummerNewVersion = process.argv[3]

if (!createSummerNewVersion) {
  console.error('Error: Missing Version')
  process.exit()
}

if (createSummerNewVersion.split('.').length !== 3) {
  console.error('Error: Version must like 1.0.0')
  process.exit()
}

packageFiles.forEach((f) => {
  const content = fs.readFileSync(f, { encoding: 'utf-8' })
  const json = JSON.parse(content)
  json.version = newVersion
  fs.writeFileSync(f, JSON.stringify(json, null, '\t'))
})

templateFiles.forEach((f) => {
  const content = fs.readFileSync(f, { encoding: 'utf-8' })
  const json = JSON.parse(content)
  json.dependencies['@summer-js/summer'] = newVersion
  json.dependencies['@summer-js/test'] = newVersion
  json.dependencies['@summer-js/cli'] = newVersion
  if (json.dependencies['@summer-js/swagger']) {
    json.dependencies['@summer-js/swagger'] = newVersion
  }
  if (json.dependencies['@summer-js/typeorm']) {
    json.dependencies['@summer-js/typeorm'] = newVersion
  }
  fs.writeFileSync(f, JSON.stringify(json, null, '\t'))
})

const createSummerPackage = './create-summer/package.json'
const content = fs.readFileSync(createSummerPackage, { encoding: 'utf-8' })
const json = JSON.parse(content)
json.version = createSummerNewVersion
fs.writeFileSync(createSummerPackage, JSON.stringify(json, null, '\t'))
