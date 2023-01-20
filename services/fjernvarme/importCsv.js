const csv = require('./reader')
const { opendir } = require('node:fs/promises')
const path = require('path')

async function readAll() {
  const uploadPath = path.resolve(path.join(__dirname, 'upload'));
  const dir = await opendir(uploadPath)
  const fileNames = []
  for await (const dirent of dir) {
    fileNames.push(dirent.name)
  }
  fileNames.sort()
  for (const fileName of fileNames) {
    await csv.reader(path.join(uploadPath, fileName))
  }
  console.log('done')
}
readAll()
