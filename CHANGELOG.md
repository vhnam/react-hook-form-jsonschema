# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Built-in JSON Schema `format` validation for the official Draft 2020-12 section 7.3 string formats, including email, hostname, IP address, URI/IRI, UUID, JSON Pointer, URI Template, duration, date/time, and regex checks.
- Tiered form-builder behavior for `format`: native widgets for `date`, `time`, `date-time`, `email`, and `uri`; text inputs with validation for UUID/IP/hostname formats; and text validation for API/config-oriented formats.
- `ErrorTypes.format` with error metadata that reports the expected schema `format`.
- Example app route for tiered `format` validation.

### Changed

- `useInput` maps `format: "time"` to `<input type="time">` and keeps `format: "hostname"` as a text input instead of a URL input.
- `date-time` and `time` validation accepts browser-native `datetime-local` and `time` input values in addition to RFC 3339 values.
- `FormContext` skips resetting form state when rerendered schema-derived defaults or explicit `defaultValues` are semantically unchanged.

### Fixed

- `useArray` row rendering stays synchronized when schema/default changes reset array values to a different length.

## [0.4.0] - 2026-05-20

### Added

- JSON Schema `default` keyword support for primitives, nested object properties, arrays, tuple items, object-array rows, and multi-select checkbox arrays.
- JSON Schema `const` keyword support for primitive fields, object values, array values, nested object properties, and tuple/list array items.
- `useArray(pointer)` for JSON Schema array fields, including append/remove helpers, stable row metadata, item pointers, item schemas, item validators, and primitive item props.
- List array support for primitive rows, object rows rendered through `useObject`, and tuple-style `items` arrays with `additionalItems` handling.
- Array form data support for indexed JSON Pointers such as `#/properties/tags/0` and nested object rows such as `#/properties/contacts/0/properties/name`.
- Array validation for `minItems`, `maxItems`, `uniqueItems`, and per-item enum/string/number constraints.
- `ErrorTypes.notConst`, `ErrorTypes.minItems`, `ErrorTypes.maxItems`, and `ErrorTypes.uniqueItems`.
- Public array helpers and types, including `InputTypes.fieldArray`, `UseArrayReturnType`, `getArrayItemPointer`, and `getListArrayEntries`.
- Example app routes for primitive arrays, object arrays, tuple arrays, checkbox arrays, default values, const values, enums, primitive fields, and UI schema overrides.

### Changed

- **BREAKING**: `type: 'array'` in `useObject` only auto-renders as checkboxes for multi-select schemas (`items.enum` or bounded numeric ranges); open-ended list and tuple arrays should be rendered explicitly with `useArray`.
- `FormContext` derives react-hook-form defaults from schema `default` values or `const` values when no `default` is present, allows explicit `defaultValues` to override them, and resets when either source changes.
- `FormContext` validates assembled submit data against object and array `const` constraints before calling `onSubmit`.
- `getGenericValidator` applies array rules instead of returning an empty validator for `type: 'array'`.
- `getGenericValidator` and `getArrayValidator` enforce `const` constraints, including primitive form-value coercion and structural object/array comparisons.
- Multi-select checkbox arrays now derive options from shared array helpers and use array-specific error messages for `minItems`, `maxItems`, and `uniqueItems`.
- `useArray().appendItem()` initializes new rows with the item schema `default` value when available.

### Fixed

- Untouched schema defaults are included in submitted data, including nested object defaults and indexed array item defaults.
- Multi-select arrays with `uniqueItems: true` compact unchecked checkbox slots before submission, while schemas without `uniqueItems` keep positional checkbox slots.
- Multi-select checkbox defaults expand into option slots for rendering and compact back to selected values on submit.
- Array item schema traversal now resolves item and nested item pointers correctly when validating, rendering, and submitting arrays.

## [0.3.0] - 2026-05-19

### Added

- Export `useFormContext` for custom components that need the form context.
- `getCurrentValue()` on field hooks to read the current react-hook-form value for a pointer.
- `errors` on `JSONFormContextValues` so consumers can react to validation state.
- Example app rewritten with Vite and TypeScript (`example/`).

### Changed

- **BREAKING**: Peer dependencies now require React 18 and react-hook-form v7 (previously React 16 with react-hook-form v4 bundled as a dependency).
- **BREAKING**: `noNativeValidate` defaults to `true`; native browser validation is off unless you set `noNativeValidate={false}`.
- **BREAKING**: `onSubmit` handler is no longer `async`-wrapped by the library; return a `Promise` from your callback if you need async submit.
- `onChange` uses a `watch` subscription (react-hook-form v7) instead of reading values during render.
- Library build uses Vite; tests use Jest and Testing Library instead of `@vtex/test-tools`.
- TypeScript 5.x, ESLint 9 (flat config), and Prettier 3 for development.
- README updated for the current API, tooling, and JSON Schema resource links.
- `$ref` resolution and schema traversal refactored to avoid mutating input schema objects.

### Fixed

- `FormContext` re-renders after validation so error UI updates reliably with react-hook-form v7.
- `onChange` is only subscribed when the prop is provided.
- Frozen input schemas remain immutable when resolving references.

### Removed

- Husky git hooks (maintainers can use Lefthook via `lefthook.yml`).

## [0.2.0] - 2021-08-03

### Added

- `useInput` maps string `format` values `date` and `date-time` to HTML `date` and `datetime-local` input types.

## [0.2.0-beta.13] - 2020-03-26

### Fixed

- Prevent `onChange` from being triggered during the initial render.

## [0.2.0-beta.12] - 2020-03-20

### Added

- `defaultValues` prop.

### Security

- Upgrade all upgradable dependencies.

## [0.2.0-beta.11] - 2020-02-21

### Fixed

- `getDataFromPath` to `getDataFromPointer` as declared in the `README.md`.

## [0.2.0-beta.10] - 2020-02-21

### Fixed

- Typo in `ErrorTypes`

### Added

- `onChange` and `formProps` props to `FormContext`.

### Changed

- **BREAKING**: no longer uses paths starting with `$` (which was added at version `0.2.0-beta.6`) and all 'paths' should now be relative to the JSON Schema, respecting the [RFC 6901](https://tools.ietf.org/html/rfc6901) which defines the string syntax for JSON Pointers, pay special attention to [section 6](https://tools.ietf.org/html/rfc6901#section-6) which defines the URI frament identifier representation of JSON pointers.

## [0.2.0-beta.9] - 2020-02-18

### Fixed

- `notInEnum` to return expected value in `expected` field of the `ErrorMessage`.

## [0.2.0-beta.8] - 2020-02-17

### Changed

- **BREAKING**: `number` error messages to now return messages describing whether the input does not match the expected pattern for a number.

## [0.2.0-beta.7] - 2020-02-14

### Changed

- **BREAKING**: `onSubmit` now passes an object with `data`, `event` and `methods` as members to the callback.

## [0.2.0-beta.6] - 2020-02-13

### Added

- `$ref` and `$id` resolving in accord to the [JSON Schema specification](https://tools.ietf.org/html/draft-wright-json-schema-01)

### Changed

- **BREAKING**: Now uses paths starting with `$` to represent objects of an instance of the JSON Schema, instead of a path starting with `#`, which resembled a URI fragment identifier representation of a JSON pointer.
- custom validator `context` parameter now gives info as an annotated sub schema

### Fixed

- Not checking if value exists before using enum validation on it
- `isRequired` not evaluating correctly if it is inside another object that is not required
- Empty data not being ignored when parsing form data

## [0.2.0-beta.5] - 2020-02-11

### Added

- `customValidators` to allow the user to define their own validation functions

### Changed

- **BREAKING**: Renamed `FormValuesWithSchema` type to `JSONFormContextValues`

## [0.2.0-beta.4] - 2020-02-05

### Fixed

- Returning non-filled form inputs in the object passed to onSubmit

## [0.2.0-beta.3] - 2020-01-31

### Changed

- **BREAKING**: Changed `InputTypes` and `UITypes` enum values to reflect their enum names and what was documented in the `README`
- **BREAKING**: Changed `min` and `max` props returned from `getInputProps()` to be strings, not numbers
- **BREAKING**: Just re-exports types and `Controller` component from `react-hook-form`

## [0.2.0-beta.2] - 2020-01-30

### Fixed

- type of onChange possibly being undefined

## [0.2.0-beta.1] - 2020-01-29

### Added

- Added `useCheckbox` hook

### Changed

- Changed the BasicInputReturnType to also return a reference to the validator used
- **BREAKING**: The `useObject` hook now automatically associates a boolean to a checkbox

### Fixed

- Fixed returned form data not converting string values that represent booleans to actual booleans

## [0.2.0-beta.0] - 2020-01-23

### Changed

- Renamed `'mode'` prop on FormContext to `'validationMode'`

## [0.2.0-beta] - 2020-01-22

### Added

- Now re-exports the `react-hook-form` public API

## [0.1.3] - 2020-01-21

### Added

- Added test to make sure schema is not modified

### Changed

- Fixed tons of typos on README
- Made README more friendly
- Refactored internal API to be more easily expandable
- Removed complexity from big function bodies

## [0.1.2] - 2020-01-21

### Added

- Typings for JSON Schema object
- Removed unused mock

### Changed

- Add typings for JSON Schema object
- Build process is cleaner
- React hook form is now an external dependency, not bundled with the code anymore

## [0.1.1] - 2020-01-17

### Added

- Initial implementation.
