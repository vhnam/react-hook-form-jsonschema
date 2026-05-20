import type { ExampleDefinition } from '../shared/types'

import { example as arrayContacts } from './array-contacts'
import { example as arrayTags } from './array-tags'
import { example as arrayTuple } from './array-tuple'
import { example as checkbox } from './checkbox'
import { example as conditional201909 } from './conditional-2019-09'
import { example as conditionalDraft07 } from './conditional-draft-07'
import { example as conditionalFields } from './conditional-fields'
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
  conditionalDraft07,
  conditional201909,
  conditionalFields,
  uiOverrides,
  arrayTags,
  arrayContacts,
  arrayTuple,
]
