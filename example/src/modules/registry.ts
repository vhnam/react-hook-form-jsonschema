import type { ExampleDefinition } from '../shared/types'

import { example as arrayContacts } from './array-contacts'
import { example as arrayTags } from './array-tags'
import { example as arrayTuple } from './array-tuple'
import { example as checkbox } from './checkbox'
import { example as constKeyword } from './const'
import { example as defaultKeyword } from './default'
import { example as enums } from './enums'
import { example as format } from './format'
import { example as primitives } from './primitives'
import { example as uiOverrides } from './ui-overrides'

/** All examples — add a module folder and register it here. */
export const examples: ExampleDefinition[] = [
  primitives,
  defaultKeyword,
  constKeyword,
  format,
  enums,
  checkbox,
  uiOverrides,
  arrayTags,
  arrayContacts,
  arrayTuple,
]
