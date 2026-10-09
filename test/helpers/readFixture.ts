import fs from "fs";
import path from "path";


export function readFixture(fixtureName) {
  return JSON.parse(fs.readFileSync(path.join(path.resolve(), 'test', 'fixtures', `${fixtureName}.json`)).toString())
}
