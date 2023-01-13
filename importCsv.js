const csv = require('./lib/fjernvarme/reader')
const { opendir } = require('node:fs/promises')
const path = require('path')

async function readAll() {
  const uploadPath = path.resolve(path.join(__dirname, 'upload'));
  const dir = await opendir(uploadPath)
  for await (const dirent of dir) {
    await csv.reader(path.join(uploadPath, dirent.name))
  }
  console.log('done')
}
readAll()
