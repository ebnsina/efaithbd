import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { ImageUpload } from '@/components/image-upload'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

type BaseProps = { label: string; description?: string }

// Errors show once the field was touched or a submit was attempted, not while typing the first character
function useFieldErrors() {
  const field = useFieldContext<unknown>()
  const { isTouched, errors } = field.state.meta
  const submitted = field.form.state.submissionAttempts > 0
  const visible = (isTouched || submitted) && errors.length > 0
  return { field, invalid: visible, errors: visible ? (errors as { message?: string }[]) : [] }
}

function TextField({
  label,
  description,
  ...inputProps
}: BaseProps & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'onBlur' | 'name'>) {
  const { field, invalid, errors } = useFieldErrors()
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={(field.state.value as string) ?? ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={invalid}
        {...inputProps}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  )
}

function NumberField({
  label,
  description,
  ...inputProps
}: BaseProps & Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'onBlur' | 'name' | 'type'>) {
  const { field, invalid, errors } = useFieldErrors()
  const value = field.state.value as number | null
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        type="number"
        inputMode="decimal"
        value={value ?? ''}
        onChange={(e) => field.handleChange(e.target.value === '' ? null : e.target.valueAsNumber)}
        onBlur={field.handleBlur}
        aria-invalid={invalid}
        {...inputProps}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  )
}

function TextareaField({
  label,
  description,
  ...textareaProps
}: BaseProps & Omit<React.ComponentProps<typeof Textarea>, 'value' | 'onChange' | 'onBlur' | 'name'>) {
  const { field, invalid, errors } = useFieldErrors()
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Textarea
        id={field.name}
        name={field.name}
        value={(field.state.value as string) ?? ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={invalid}
        {...textareaProps}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  )
}

function SwitchField({ label, description }: BaseProps) {
  const { field } = useFieldErrors()
  return (
    <Field orientation="horizontal">
      <Switch
        id={field.name}
        checked={Boolean(field.state.value)}
        onCheckedChange={(checked) => field.handleChange(checked)}
      />
      <div>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </div>
    </Field>
  )
}

function SelectField({
  label,
  description,
  options,
  placeholder,
}: BaseProps & { options: { value: string; label: string }[]; placeholder?: string }) {
  const { field, invalid, errors } = useFieldErrors()
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Select
        items={options}
        value={(field.state.value as string) || null}
        onValueChange={(value) => {
          field.handleChange(value ?? '')
          field.handleBlur()
        }}
      >
        <SelectTrigger id={field.name} aria-invalid={invalid} className="w-full">
          <SelectValue placeholder={placeholder ?? `Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  )
}

function ColorField({ label, description }: BaseProps) {
  const { field, invalid, errors } = useFieldErrors()
  const value = (field.state.value as string) ?? ''
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <div className="flex gap-2">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          aria-label={`${label} picker`}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <Input
          id={field.name}
          name={field.name}
          value={value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={invalid}
          className="font-mono"
        />
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  )
}

// Single image stored as a string, or a list when `multiple` is set
function ImageField({ label, multiple, maxImages }: BaseProps & { multiple?: boolean; maxImages?: number }) {
  const { field, errors } = useFieldErrors()
  const value = field.state.value as string | string[] | null
  const images = Array.isArray(value) ? value : value ? [value] : []
  return (
    <Field>
      <ImageUpload
        label={label}
        images={images}
        maxImages={multiple ? maxImages : 1}
        onChange={(next) => {
          field.handleChange(multiple ? next : (next[0] ?? ''))
          field.handleBlur()
        }}
      />
      <FieldError errors={errors} />
    </Field>
  )
}

function SubmitButton({ label, pendingLabel, className = 'w-full' }: { label: string; pendingLabel?: string; className?: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting} className={className}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? (pendingLabel ?? label) : label}
        </Button>
      )}
    </form.Subscribe>
  )
}

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, NumberField, TextareaField, SwitchField, SelectField, ImageField, ColorField },
  formComponents: { SubmitButton },
})
