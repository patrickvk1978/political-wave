import type { District } from '../../lib/types'

import akHouse       from './ak-house.json'
import akSenate      from './ak-senate.json'
import azHouse       from './az-house.json'
import azSenate      from './az-senate.json'
import gaHouse       from './ga-house.json'
import gaSenate      from './ga-senate.json'
import miHouse       from './mi-house.json'
import miSenate      from './mi-senate.json'
import mnHouse       from './mn-house.json'
import mnSenate      from './mn-senate.json'
import neLegislature from './ne-legislature.json'
import txHouse       from './tx-house.json'
import wiAssembly    from './wi-assembly.json'
import wiSenate      from './wi-senate.json'

export const ALL_DISTRICTS: District[] = [
  ...akHouse,
  ...akSenate,
  ...azHouse,
  ...azSenate,
  ...gaHouse,
  ...gaSenate,
  ...miHouse,
  ...miSenate,
  ...mnHouse,
  ...mnSenate,
  ...neLegislature,
  ...txHouse,
  ...wiAssembly,
  ...wiSenate,
] as District[]
