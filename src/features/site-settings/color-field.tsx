import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

// Local stand-in until form.tsx gets a ColorField: a swatch picker plus the hex code
export function ColorField({
  name,
  label,
  value,
  onChange,
  onBlur,
  errors,
}: {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  errors: { message?: string }[]
}) {
  const invalid = errors.length > 0
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <div className="flex gap-2">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-label={`${label} picker`}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <Input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={invalid}
          placeholder="#1a1a1a"
          className="font-mono"
        />
      </div>
      <FieldError errors={errors} />
    </Field>
  )
}
