import fs from 'fs'
import { join } from 'path'

import { Helper } from '../src'

const helper = new Helper(fs.readFileSync('./dxfs/tdk.dxf', 'utf-8'))

console.log(helper.toPolylines());
