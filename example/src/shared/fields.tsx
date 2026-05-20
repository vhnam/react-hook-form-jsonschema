import {
  useArray,
  useObject,
  InputTypes,
  type InputReturnTypes,
  type UseRawInputReturnType,
  type UseRadioReturnType,
  type UseSelectReturnType,
  type UseCheckboxReturnType,
  type UseTextAreaReturnType,
  type BasicInputReturnType,
  type UseArrayReturnType,
  type UISchemaType,
} from 'react-hook-form-jsonschema'

export function FieldError({ field }: { field: BasicInputReturnType }) {
  const error = field.getError()

  if (!error) {
    return null
  }

  return (
    <p className="field-error" role="alert">
      {String(error.message)}
    </p>
  )
}

export function SpecializedField({ field }: { field: InputReturnTypes }) {
  switch (field.type) {
    case InputTypes.input: {
      const input = field as UseRawInputReturnType
      const inputProps = input.getInputProps()

      if (inputProps.type === 'hidden') {
        return (
          <div className="field field--hidden">
            <p className="field-note">
              Hidden field <code>{input.name}</code> (value is included on submit)
            </p>
            <input {...inputProps} />
          </div>
        )
      }

      return (
        <div className="field">
          <label {...input.getLabelProps()}>
            {input.getObject().title ?? input.name}
          </label>
          {input.getObject().description && (
            <p className="field-description">{input.getObject().description}</p>
          )}
          <input {...inputProps} />
        </div>
      )
    }
    case InputTypes.radio: {
      const radio = field as UseRadioReturnType

      return (
        <div className="field">
          <span className="field-label">{radio.getObject().title}</span>
          <div className="option-group">
            {radio.getItems().map((value, index) => (
              <label
                {...radio.getItemLabelProps(index)}
                key={`${value}${index}`}
                className="option"
              >
                {value}
                <input {...radio.getItemInputProps(index)} />
              </label>
            ))}
          </div>
        </div>
      )
    }
    case InputTypes.select: {
      const select = field as UseSelectReturnType

      return (
        <div className="field">
          <label {...select.getLabelProps()}>
            {select.getObject().title ?? select.name}
          </label>
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
        </div>
      )
    }
    case InputTypes.checkbox: {
      const checkbox = field as UseCheckboxReturnType

      return (
        <div className="field">
          <span className="field-label">{checkbox.getObject().title}</span>
          <div className="option-group">
            {checkbox.getItems().map((value, index) => (
              <label
                {...checkbox.getItemLabelProps(index)}
                key={`${value}${index}`}
                className="option"
              >
                {checkbox.isSingle ? checkbox.getObject().title : value}
                <input {...checkbox.getItemInputProps(index)} />
              </label>
            ))}
          </div>
        </div>
      )
    }
    case InputTypes.textArea: {
      const textArea = field as UseTextAreaReturnType

      return (
        <div className="field">
          <label {...textArea.getLabelProps()}>
            {textArea.getObject().title ?? textArea.name}
          </label>
          <textarea {...textArea.getTextAreaProps()} rows={4} />
        </div>
      )
    }
    default:
      return null
  }
}

export function ObjectFields(props: { pointer: string; UISchema?: UISchemaType }) {
  const fields = useObject({
    pointer: props.pointer,
    UISchema: props.UISchema,
  })

  return (
    <>
      {fields.map(field => (
        <div key={`${field.type}${field.pointer}`} className="field-wrapper">
          <SpecializedField field={field} />
          <FieldError field={field} />
        </div>
      ))}
    </>
  )
}

function ArrayPrimitiveControl(props: {
  array: UseArrayReturnType
  index: number
  ariaLabel: string
}) {
  const itemOptions = props.array.getItemOptions(props.index)

  if (itemOptions.length > 0) {
    return (
      <select
        {...props.array.getItemSelectProps(props.index)}
        aria-label={props.ariaLabel}
      >
        <option value="">Select an option</option>
        {itemOptions.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      {...props.array.getItemInputProps(props.index)}
      aria-label={props.ariaLabel}
    />
  )
}

export function ListArrayField({ pointer }: { pointer: string }) {
  const array = useArray(pointer)
  const title = array.getObject().title ?? array.name

  return (
    <div className="field array-field">
      <span className="field-label">{title}</span>
      {array.getFields().map((row, index) => {
        const itemSchema = array.getItemSchema(index)
        const itemTitle = itemSchema?.title ?? `Item ${index + 1}`

        return (
          <div key={row.id} className="array-row">
            {array.isPrimitiveItem(index) ? (
              <>
                <label {...array.getItemLabelProps(index)}>{itemTitle}</label>
                <ArrayPrimitiveControl
                  array={array}
                  index={index}
                  ariaLabel={`${title}-${index}`}
                />
              </>
            ) : (
              <fieldset className="array-row-object">
                <legend>{itemTitle}</legend>
                <ObjectFields pointer={array.getItemPointer(index)} />
              </fieldset>
            )}
            {array.canRemove(index) && (
              <button
                type="button"
                onClick={() => array.removeItem(index)}
                className="array-remove"
              >
                Remove
              </button>
            )}
          </div>
        )
      })}
      {array.canAdd() && (
        <button type="button" onClick={() => array.appendItem()}>
          Add {title}
        </button>
      )}
      <FieldError field={array} />
    </div>
  )
}

export function TupleArrayField({ pointer }: { pointer: string }) {
  const array = useArray(pointer)
  const title = array.getObject().title ?? array.name

  return (
    <div className="field array-field">
      <span className="field-label">{title}</span>
      <p className="field-note">
        Tuple <code>items</code> — each row uses the schema at that index.
      </p>
      {array.getFields().map((row, index) => {
        const itemSchema = array.getItemSchema(index)

        return (
          <div key={row.id} className="array-row">
            <label {...array.getItemLabelProps(index)}>
              {itemSchema?.title ?? `Index ${index}`}
            </label>
            <ArrayPrimitiveControl
              array={array}
              index={index}
              ariaLabel={`${title}-${index}`}
            />
            {array.canRemove(index) && (
              <button
                type="button"
                onClick={() => array.removeItem(index)}
                className="array-remove"
              >
                Remove
              </button>
            )}
          </div>
        )
      })}
      {array.canAdd() && (
        <button type="button" onClick={() => array.appendItem()}>
          Add tuple slot
        </button>
      )}
      <FieldError field={array} />
    </div>
  )
}
