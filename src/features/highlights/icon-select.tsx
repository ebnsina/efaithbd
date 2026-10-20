import { HugeiconsIcon } from '@hugeicons/react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type HighlightIconKey, highlightIconKeys, highlightIcons } from './icons'

export function IconSelect({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (key: HighlightIconKey) => void
}) {
  return (
    <Select value={value} onValueChange={(key) => key && onChange(key as HighlightIconKey)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue>
          {(key: HighlightIconKey) =>
            highlightIcons[key] && (
              <>
                <HugeiconsIcon icon={highlightIcons[key].icon} />
                {highlightIcons[key].label}
              </>
            )
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {highlightIconKeys.map((key) => (
          <SelectItem key={key} value={key}>
            <HugeiconsIcon icon={highlightIcons[key].icon} />
            {highlightIcons[key].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
