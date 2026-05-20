# react-hook-form-jsonschema

> React hooks library built on [react-hook-form](https://github.com/react-hook-form/react-hook-form) for creating customizable forms from a [JSON Schema](https://json-schema.org/understanding-json-schema/index.html) with built-in validation.

`react-hook-form-jsonschema` manages the stateful logic needed to render a form from a JSON Schema. Each field hook returns props helpers (`getInputProps`, `getLabelProps`, and similar) that you spread onto your own markup.

The package is written in **TypeScript**, targets **React 18**, and depends on **react-hook-form v7**.

Try a live demo on [CodeSandbox](https://codesandbox.io/s/react-hook-form-jsonschema-basic-example-u68o7), or run the local example:

```bash
cd example && pnpm install && pnpm dev
```

The local example app includes routes for primitive fields, enums, checkboxes, default values, const values, primitive arrays, object arrays, tuple arrays, and UI schema overrides.

[Supported JSON Schema keywords](#supported-json-schema-keywords)

## Table of Contents

- [react-hook-form-jsonschema](#react-hook-form-jsonschema)
  - [Table of Contents](#table-of-contents)
  - [Simple Usage](#simple-usage)
  - [Installation](#installation)
  - [API](#api)
  - [Components API](#components-api)
    - [FormContext component API](#formcontext-component-api)
  - [Functions API](#functions-api)
    - [getDataFromPointer(pointer, data)](#getdatafrompointerpointer-data)
    - [getArrayItemPointer(arrayPointer, index)](#getarrayitempointerarraypointer-index)
    - [getListArrayEntries(values, pointer)](#getlistarrayentriesvalues-pointer)
  - [Hooks API](#hooks-api)
    - [useArray(pointer)](#usearraypointer)
    - [useCheckbox(pointer)](#usecheckboxpointer)
    - [useHidden(pointer)](#usehiddenpointer)
    - [useInput(pointer)](#useinputpointer)
    - [useObject(pointer, UISchema)](#useobjectpointer-uischema)
    - [usePassword(pointer)](#usepasswordpointer)
    - [useRadio(pointer)](#useradiopointer)
    - [useSelect(pointer)](#useselectpointer)
    - [useTextArea(pointer)](#usetextareapointer)
  - [Supported JSON Schema keywords](#supported-json-schema-keywords)
  - [TODO/Next Steps](#todonext-steps)
  - [Useful resources](#useful-resources)

## Simple Usage

Suppose you have a JSON Schema for a person’s first name:

```ts
const personSchema = {
  $id: 'https://example.com/person.schema.json',
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Person',
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      title: 'First Name',
      description: "The person's first name.",
      default: 'Jane',
    },
  },
}
```

Wrap your form in `FormContext`, then use `useInput()` with a JSON Pointer to the field. Hooks must be called inside `FormContext`:

```tsx
import { FormContext, useInput } from 'react-hook-form-jsonschema'

function FirstNameField() {
  const inputMethods = useInput('#/properties/firstName')

  return (
    <>
      <label {...inputMethods.getLabelProps()}>
        {inputMethods.getObject().title ?? inputMethods.name}
      </label>
      <input {...inputMethods.getInputProps()} />
    </>
  )
}

function PersonForm() {
  return (
    <FormContext schema={personSchema}>
      <FirstNameField />
    </FormContext>
  )
}
```

Schema `default` values are applied as initial form values and are included in submitted data even when the user does not touch the field. When a schema has `const` and no `default`, the `const` value is used as the initial form value.

See `example/src/modules/` for fuller examples, including default values, const values, `useObject`, `useArray`, and UI schema overrides.

## Installation

With npm:

```bash
npm install react-hook-form-jsonschema react-hook-form
```

With yarn:

```bash
yarn add react-hook-form-jsonschema react-hook-form
```

With pnpm:

```bash
pnpm add react-hook-form-jsonschema react-hook-form
```

**Peer dependencies:** `react`, `react-dom`, and `react-hook-form` (see `package.json` for supported versions).

## API

`react-hook-form-jsonschema` re-exports all [`react-hook-form`](https://react-hook-form.com/) types and the `Controller` component. Field behavior is provided by this library’s hooks and `FormContext`.

**Components:** `FormContext`, `useFormContext`

**Hooks:** `useInput`, `useHidden`, `usePassword`, `useRadio`, `useSelect`, `useTextArea`, `useCheckbox`, `useArray`, `useObject`

**Utilities:** `getDataFromPointer`, `getArrayItemPointer`, `getListArrayEntries`, JSON Schema helpers from `./JSONSchema`

**Types & enums:** `InputTypes`, `UITypes`, `ErrorTypes`, `FormContextProps`, `OnSubmitParameters`, `UISchemaType`, `UseArrayReturnType`, `ObjectJSONSchemaType`, and related hook return types

## Components API

### FormContext component API

Top-level provider that holds the schema, resolved `$ref`s, validation options, and the underlying `react-hook-form` instance. All field hooks must be used under `FormContext` (as children of the rendered `<form>`).

The library also exports `useFormContext()` to access the same context value from custom components.

#### props:

##### Required:

- `schema`: JSON Schema object passed to hooks for validation and structure. Internal `$ref` / `$id` references are resolved when the context is created.

##### Optional:

- `customValidators`: Object whose values are functions with the signature:
  - `(value: string, context: JSONSubSchemaInfo) => CustomValidatorReturnValue`
  - **Parameters:**
    - `value`: Current value in the form input.
    - `context`: Object with:
      - `JSONSchema`: Sub-schema for the current field
      - `isRequired`: Whether the field is required
      - `objectName`: Name of the sub-schema node
      - `invalidPointer`: `true` if the pointer was not found in the schema
      - `pointer`: JSON Pointer to the sub-schema (e.g. `#/properties/address/properties/name`). See [RFC 6901](https://tools.ietf.org/html/rfc6901).
  - **Return value:** An error message `string`, or `true` if validation passed.
- `formProps`: Props forwarded to the underlying `<form>` element (same as React’s `<form>`, except `onSubmit`, which this library sets).
- `validationMode`: When to run validation. Default: `'onSubmit'`. Same values as react-hook-form’s `mode`:
  - `'onBlur'`
  - `'onChange'`
  - `'onSubmit'`
  - `'onTouched'`
  - `'all'`
- `revalidateMode`: When fields with errors are re-validated. Default: `'onChange'`.
  - `'onBlur'`
  - `'onChange'`
  - `'onSubmit'`
- `submitFocusError`: When `true`, focus the first invalid field after submit. Default: `true`.
- `onChange`: Called when form values change. Receives form **data** shaped according to the JSON Schema (via `getObjectFromForm`).
- `onSubmit`: Submit handler. Receives:
  - `data`: Form values formatted as a JSON Schema instance
  - `event`: React synthetic event (if available)
  - `methods`: `JSONFormContextValues` — full form context, including react-hook-form methods such as `trigger`, `reset`, and `setValue`
- `noNativeValidate`: When `true`, sets `noValidate` on the `<form>` so the browser does not block submit. Default: `true`. Native validation is disabled because this library does not implement URI/email `format` validation in HTML5 attributes.
- `defaultValues`: Initial form values keyed by JSON Pointer. These override any `default` or `const`-derived values from the JSON Schema.

`FormContext` derives react-hook-form defaults from the resolved schema's `default` keywords, including primitives, nested object properties, arrays, tuple items, object-array rows, and multi-select checkbox arrays. If `default` is not present, `const` is used as the initial value. If either schema-derived defaults or explicit `defaultValues` change on rerender, the form resets to the new merged defaults.

`const` validation is enforced for primitive field hooks and array item validators. Object and array `const` constraints are checked against the assembled schema-shaped data before `onSubmit` is called, so invalid const data blocks submission and reports `ErrorTypes.notConst`.

```ts
const schema = {
  type: 'object',
  properties: {
    environment: {
      type: 'string',
      const: 'production',
    },
  },
}
```

## Functions API

### getDataFromPointer(pointer, data)

**Description**

Reads a scalar value from schema-shaped form data at the given JSON Pointer.

**Parameters**

- `pointer`: JSON Pointer to the desired value.
- `data`: Object in the shape produced by `onSubmit` / `onChange`.

**Return**

The value at that pointer as a `string` (numbers and booleans are stringified), or `undefined` if the pointer does not resolve to a scalar.

**Example**

```ts
const schema = {
  type: 'object',
  properties: {
    address: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
    },
  },
}

const data = {
  address: {
    name: 'Foo',
  },
}

const pointer = '#/properties/address/properties/name'

getDataFromPointer(pointer, data) // "Foo"
```

### getArrayItemPointer(arrayPointer, index)

**Description**

Builds the indexed JSON Pointer used by `useArray` rows.

**Parameters**

- `arrayPointer`: JSON Pointer to the array field.
- `index`: Zero-based row index.

**Return**

The row pointer as a `string`.

**Example**

```ts
getArrayItemPointer('#/properties/tags', 0) // "#/properties/tags/0"
```

### getListArrayEntries(values, pointer)

**Description**

Reads list-array row values from flat react-hook-form values keyed by indexed JSON Pointers.

**Parameters**

- `values`: Current form values.
- `pointer`: JSON Pointer to the array field.

**Return**

An array of row values sorted by index.

**Example**

```ts
const values = {
  '#/properties/tags/0': 'react',
  '#/properties/tags/1': 'json-schema',
}

getListArrayEntries(values, '#/properties/tags') // ["react", "json-schema"]
```

## Hooks API

Every field hook returns a **basic input object** with these common members:

- `type`: Input kind from **`InputTypes`**:
  - `generic`: Default; only common fields
  - `radio`: `<input type="radio">`
  - `select`: `<select>`
  - `input`: Generic `<input>`
  - `textArea`: `<textarea>`
  - `checkbox`: `<input type="checkbox">`
  - `fieldArray`: Dynamic list returned by `useArray` (`InputTypes.fieldArray === 'array'`)
- `pointer`: JSON Pointer to the sub-schema (e.g. `#/properties/child/properties/here`). See [RFC 6901](https://tools.ietf.org/html/rfc6901).
- `name`: Last segment of the pointer (`here` in the example above).
- `isRequired`: Whether the field is required.
- `validator`: `RegisterOptions` passed to react-hook-form for this field.
- `formContext`: `JSONFormContextValues` (schema, errors, and react-hook-form methods).
- `getError()`: Returns an `ErrorMessage` or `undefined`:
  - `{ message: ErrorTypes | string, expected: ErrorMessageValues }`
  - **`ErrorTypes`** (exported enum):
    - `required` — `__form_error_required__`
    - `maxLength` — `__form_error_maxLength__`
    - `minLength` — `__form_error_minLength__`
    - `maxValue` — `__form_error_maxValue__`
    - `minValue` — `__form_error_minValue__`
    - `pattern` — `__form_error_pattern__`
    - `notInteger` — `__form_error_notInteger__`
    - `notFloat` — `__form_error_notFloat__`
    - `multipleOf` — `__form_error_multipleOf__`
    - `minItems` — `__form_error_minItems__`
    - `maxItems` — `__form_error_maxItems__`
    - `uniqueItems` — `__form_error_uniqueItems__`
    - `notInEnum` — `__form_error_notInEnum`
    - `notConst` — `__form_error_notConst__`
    - `undefinedError` — `__form_error_undefinedError__`
  - Custom validators may set `message` to a plain `string`.
  - **`ErrorMessageValues`**: Expected constraint value (`true` for required, numeric bounds for min/max, etc.).
- `getObject()`: Sub-schema for this field (`JSONSchemaType`).
- `getCurrentValue()`: Current react-hook-form value for this pointer.

**All examples below assume components are rendered as children of `FormContext`.**

### useArray(pointer)

**Description**

Build a dynamic list field for JSON Schema `array` types. Use this for arrays of primitives (e.g. strings), object rows rendered with `useObject` on each `getItemPointer(index)`, or tuple-style `items` arrays with `additionalItems` handling.

Multi-select arrays (fixed options from `items.enum` or a numeric range) still use `useCheckbox` — `useObject` picks the right hook automatically.

List arrays store row values at indexed JSON Pointers such as `#/properties/tags/0`; `onSubmit` and `onChange` convert those values back into JSON Schema-shaped arrays.

**Parameters:**

- `pointer`: JSON Pointer to the array sub-schema.

**Return:**

Common fields plus:

- `getFields()`: Row metadata (`{ id }`) for React keys.
- `getItemPointer(index)`: JSON Pointer to one element (e.g. `#/properties/tags/0`).
- `getItemSchema(index)`: Resolved `items` schema for that row (supports tuple `items` arrays).
- `getItemValidator(index)`: react-hook-form validator for that row’s item schema.
- `getItemInputProps(index)`: Input props for primitive item types.
- `getItemLabelProps(index)`: Label props for a primitive row.
- `appendItem()` / `removeItem(index)`: Add or remove rows (`minItems`, `maxItems`, tuple length, item schema `default`, and `additionalItems` respected).
- `canAdd()` / `canRemove(index)`: Whether add/remove is allowed.
- `isPrimitiveItem(index)`: `true` when the row can use `getItemInputProps`.

**Example (array of strings):**

```tsx
function TagsField({ pointer }: { pointer: string }) {
  const arrayMethods = useArray(pointer)

  return (
    <>
      <p>{arrayMethods.getObject().title}</p>
      {arrayMethods.getFields().map((field, index) => (
        <div key={field.id}>
          <input
            {...arrayMethods.getItemInputProps(index)}
            aria-label={`item-${index}`}
          />
          {arrayMethods.canRemove(index) && (
            <button
              type="button"
              onClick={() => arrayMethods.removeItem(index)}
            >
              Remove
            </button>
          )}
        </div>
      ))}
      {arrayMethods.canAdd() && (
        <button type="button" onClick={() => arrayMethods.appendItem()}>
          Add
        </button>
      )}
      {arrayMethods.getError() && <p>{arrayMethods.getError()?.message}</p>}
    </>
  )
}
```

**Example (array of objects):** map `getFields()` and render `<ObjectRenderer pointer={arrayMethods.getItemPointer(index)} />` for each row.

### useCheckbox(pointer)

**Description**

Build a single or multi-option checkbox field. For `type: 'array'`, this is used when options are a fixed set (`items.enum` or a bounded numeric range). Schema defaults for multi-select arrays are expanded into checkbox option slots for rendering and compacted back to selected values on submit. For open-ended lists, use `useArray`.

**Parameters:**

- `pointer`: JSON Pointer to the sub-schema to render.

**Return:**

Common fields plus:

- `isSingle`: `true` when there is only one checkbox option.
- `getItems()`: Option values derived from the schema.
- `getItemInputProps(index)`: Props for the checkbox at `index` (spread on `<input>`).
- `getItemLabelProps(index)`: Label props for that option.

**Example:**

```tsx
function CheckboxField({ pointer }: { pointer: string }) {
  const inputMethods = useCheckbox(pointer)

  return (
    <>
      {inputMethods.getItems().map((value, index) => (
        <label
          {...inputMethods.getItemLabelProps(index)}
          key={`${value}${index}`}
        >
          {inputMethods.isSingle ? inputMethods.getObject().title : value}
          <input {...inputMethods.getItemInputProps(index)} />
        </label>
      ))}
      {inputMethods.getError() && <p>This is an error!</p>}
    </>
  )
}
```

### useHidden(pointer)

**Description**

Hidden field included in submit data but not shown to the user.

**Parameters:**

- `pointer`: JSON Pointer to the sub-schema to render.

**Return:**

Common fields plus:

- `getLabelProps()`: Label props linked to the input.
- `getInputProps()`: Props for `<input type="hidden">` (spread on `<input>`).

**Example:**

```tsx
function HiddenField() {
  const inputMethods = useHidden('#/properties/foo')

  return <input {...inputMethods.getInputProps()} />
}
```

### useInput(pointer)

**Description**

Generic text/number input with validation derived from the schema `type` and constraints.

**Parameters:**

- `pointer`: JSON Pointer to the sub-schema to render.

**Return:**

Common fields plus:

- `getLabelProps()`
- `getInputProps()`

**Example:**

```tsx
function InputField() {
  const inputMethods = useInput('#/properties/foo')

  return (
    <>
      <label {...inputMethods.getLabelProps()}>
        {inputMethods.getObject().title ?? inputMethods.name}
      </label>
      <input {...inputMethods.getInputProps()} />
    </>
  )
}
```

### useObject(pointer, UISchema)

**Description**

Renders supported properties of an object sub-schema. Unlike other hooks, `useObject` returns an **array** — one entry per rendered child field, each shaped like the corresponding specialized hook return type.

Open-ended list and tuple arrays are not auto-rendered by `useObject`; render them explicitly with `useArray`. Multi-select arrays (`items.enum` or bounded numeric ranges) still render through `useCheckbox`.

**Parameters:**

Pass a single options object:

- `pointer`: JSON Pointer to the object sub-schema (often `"#"` for the root).
- `UISchema` (optional): Per-field UI overrides relative to that object:

```ts
import { UITypes, type UISchemaType } from 'react-hook-form-jsonschema'

const uiSchema: UISchemaType = {
  type: UITypes.default,
  properties: {
    birthYear: { type: UITypes.select },
  },
}
```

**`UITypes`:**

- `default`: Infer control from schema (`string` → input, `enum` → select, `boolean` → checkbox, multi-select `array` → checkbox, other `array` → use `useArray` explicitly, etc.)
- `radio`, `select`, `input`, `hidden`, `password`, `textArea`, `checkbox`: Force the matching hook behavior

Object-typed nodes ignore `type` in the UI schema; their children are always rendered.

**Return:**

Array of hook return values (`InputReturnTypes[]`), one per rendered property.

**Example:**

```tsx
import {
  FormContext,
  useObject,
  InputTypes,
  UITypes,
  type InputReturnTypes,
  type UseRawInputReturnType,
  type UseRadioReturnType,
  type UseSelectReturnType,
  type UISchemaType,
} from 'react-hook-form-jsonschema'

const personSchema = {
  title: 'Person',
  type: 'object',
  properties: {
    firstName: { type: 'string', title: 'First Name' },
    lastName: { type: 'string', title: 'Last Name' },
    birthYear: {
      type: 'integer',
      minimum: 1930,
      maximum: 2010,
      title: 'Birth Year',
    },
  },
}

function SpecializedObject({ baseObject }: { baseObject: InputReturnTypes }) {
  switch (baseObject.type) {
    case InputTypes.input: {
      const input = baseObject as UseRawInputReturnType
      return (
        <>
          <label {...input.getLabelProps()}>{input.getObject().title}</label>
          <input {...input.getInputProps()} />
        </>
      )
    }
    case InputTypes.radio: {
      const radio = baseObject as UseRadioReturnType
      return (
        <>
          <label {...radio.getLabelProps()}>{radio.getObject().title}</label>
          {radio.getItems().map((value, index) => (
            <label {...radio.getItemLabelProps(index)} key={`${value}${index}`}>
              {value}
              <input {...radio.getItemInputProps(index)} />
            </label>
          ))}
        </>
      )
    }
    case InputTypes.select: {
      const select = baseObject as UseSelectReturnType
      return (
        <>
          <label {...select.getLabelProps()}>{select.getObject().title}</label>
          <select {...select.getSelectProps()}>
            {select.getItems().map((value, index) => (
              <option
                {...select.getItemOptionProps(index)}
                key={`${value}${index}`}
              >
                {value}
              </option>
            ))}
          </select>
        </>
      )
    }
    default:
      return null
  }
}

function ObjectRenderer({
  pointer,
  UISchema,
}: {
  pointer: string
  UISchema?: UISchemaType
}) {
  const fields = useObject({ pointer, UISchema })

  return (
    <>
      {fields.map((obj) => (
        <div key={`${obj.type}${obj.pointer}`}>
          <SpecializedObject baseObject={obj} />
          {obj.getError() && <p>This is an error!</p>}
        </div>
      ))}
    </>
  )
}

function PersonForm() {
  const uiSchema: UISchemaType = {
    type: UITypes.default,
    properties: { birthYear: { type: UITypes.select } },
  }

  return (
    <FormContext schema={personSchema}>
      <ObjectRenderer pointer="#" UISchema={uiSchema} />
    </FormContext>
  )
}
```

Example output (unchanged from earlier demos):

<img src="https://user-images.githubusercontent.com/19346539/72556402-48b35080-387d-11ea-92a0-8b5914462603.png" alt="useObject Example" width="200"/>

### usePassword(pointer)

**Description**

Password input with the same validation rules as `useInput` for the schema type.

**Parameters:**

- `pointer`: JSON Pointer to the sub-schema to render.

**Return:**

Common fields plus `getLabelProps()` and `getInputProps()` (`type="password"`).

**Example:**

```tsx
function PasswordField() {
  const inputMethods = usePassword('#/properties/foo')

  return (
    <>
      <label {...inputMethods.getLabelProps()}>{inputMethods.name}</label>
      <input {...inputMethods.getInputProps()} />
    </>
  )
}
```

### useRadio(pointer)

**Description**

Radio button group for `enum` string fields.

**Parameters:**

- `pointer`: JSON Pointer to the sub-schema to render.

**Return:**

Common fields plus:

- `getLabelProps()` (group label)
- `getItems()`
- `getItemInputProps(index)`
- `getItemLabelProps(index)`

**Example:**

```tsx
function RadioField() {
  const inputMethods = useRadio('#/properties/foo')

  return (
    <>
      <label {...inputMethods.getLabelProps()}>{inputMethods.name}</label>
      {inputMethods.getItems().map((value, index) => (
        <label
          {...inputMethods.getItemLabelProps(index)}
          key={`${value}${index}`}
        >
          {value}
          <input {...inputMethods.getItemInputProps(index)} />
        </label>
      ))}
      {inputMethods.getError() && <p>This is an error!</p>}
    </>
  )
}
```

### useSelect(pointer)

**Description**

`<select>` for `enum` fields.

**Parameters:**

- `pointer`: JSON Pointer to the sub-schema to render.

**Return:**

Common fields plus:

- `getLabelProps()`
- `getItems()`
- `getItemOptionProps(index)`
- `getSelectProps()`

**Example:**

```tsx
function SelectField() {
  const inputMethods = useSelect('#/properties/foo')

  return (
    <>
      <label {...inputMethods.getLabelProps()}>{inputMethods.name}</label>
      <select {...inputMethods.getSelectProps()}>
        {inputMethods.getItems().map((value, index) => (
          <option
            {...inputMethods.getItemOptionProps(index)}
            key={`${value}${index}`}
          >
            {value}
          </option>
        ))}
      </select>
      {inputMethods.getError() && <p>This is an error!</p>}
    </>
  )
}
```

### useTextArea(pointer)

**Description**

Multi-line text input.

**Parameters:**

- `pointer`: JSON Pointer to the sub-schema to render.

**Return:**

Common fields plus `getLabelProps()` and `getTextAreaProps()`.

**Example:**

```tsx
function TextAreaField() {
  const inputMethods = useTextArea('#/properties/foo')

  return (
    <>
      <label {...inputMethods.getLabelProps()}>{inputMethods.name}</label>
      <textarea {...inputMethods.getTextAreaProps()} />
    </>
  )
}
```

## Supported JSON Schema keywords

- `multipleOf` (integer; float `multipleOf` validation is incomplete)
- `maximum`
- `exclusiveMaximum`
- `minimum`
- `exclusiveMinimum`
- `maxLength`
- `minLength`
- `pattern`
- `items` (tuple `items` arrays supported via `useArray`; multi-select still uses `items.enum` on a single schema)
- `maxItems`
- `minItems`
- `uniqueItems` (list arrays via `useArray`; multi-select via `useCheckbox`)
- `required`
- `enum`
- `const` (field validation; object and array submit validation; also used as a form default when `default` is not provided)
- `default` (initial form values for primitives, objects, arrays, tuples, object-array rows, and multi-select checkbox arrays)
- `type` (does not support an array of types)
- `properties`
- `$id`
- `$ref` (resolved within the provided schema document via `$id` map)

Does **not** fetch a JSON Schema from a remote URI (optional in the spec). Absolute `$ref` URIs are only supported when the target schema is present in the same document’s `$id` index.

## TODO/Next Steps

### JSON Schema

- [x] Improve array type support (and its validation).
- [x] Apply schema `default` values to the form automatically.
- [x] Implement `const`.
- [ ] Implement built-in validation for `format` keyword values.
- [ ] Implement `dependencies` (Draft 07) for conditional fields.
- [ ] Implement `allOf`, `anyOf`, `oneOf`, and `not` for composite schemas.
- [ ] Optional: dedicated hooks per `format` (e.g. `useDate` for `date-time`).
- [ ] Warn when schema keywords are invalid for their declared types.
- [ ] Per-field error messages for built-in validation; scope customValidators per field.

### Compatibility

- [ ] Official React 19 support (peer deps + test matrix).
- [ ] TypeScript 6 support (upgrade toolchain, types, and CI).
- [ ] ESLint 10 support (upgrade lint config and plugins).

## Useful resources

- [JSON Schema Draft 2020-12 Core](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-01.html): Core vocabulary (meta-data, references, anchors).
- [JSON Schema Draft 2020-12 Validation](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01.html): Validation keywords and semantics.
- [RFC 6901](https://tools.ietf.org/html/rfc6901): JSON Pointers.
- [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/about) (Draft 7, 2019-09 and 2020-12 oriented; still a practical guide).
- [JSON Schema website](https://json-schema.org/)
- [react-hook-form documentation](https://react-hook-form.com/docs)
