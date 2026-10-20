// biome-ignore-all lint/suspicious/noArrayIndexKey: parsed blocks are positional and never reorder
type Inline = { text: string; bold: boolean }
type Block = { type: 'h2' | 'h3' | 'p'; content: Inline[] } | { type: 'ul'; items: Inline[][] }

// Odd indexes of the split are the text between ** pairs; an unpaired ** stays as typed
export const parseInline = (text: string): Inline[] =>
  text
    .split(/\*\*(.+?)\*\*/)
    .map((part, i) => ({ text: part, bold: i % 2 === 1 }))
    .filter((part) => part.text)

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: string[] = []
  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'p', content: parseInline(paragraph.join(' ')) })
    if (list.length) blocks.push({ type: 'ul', items: list.map(parseInline) })
    paragraph = []
    list = []
  }

  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim()
    const heading = /^(###?) (.+)$/.exec(line)
    if (!line) flush()
    else if (heading) {
      flush()
      blocks.push({ type: heading[1] === '##' ? 'h2' : 'h3', content: parseInline(heading[2].trim()) })
    } else if (line.startsWith('- ')) {
      if (paragraph.length) flush()
      list.push(line.slice(2).trim())
    } else {
      if (list.length) flush()
      paragraph.push(line)
    }
  }
  flush()
  return blocks
}

const InlineText = ({ parts }: { parts: Inline[] }) =>
  parts.map((part, i) => (part.bold ? <strong key={i}>{part.text}</strong> : <span key={i}>{part.text}</span>))

// {siteName} in page content is replaced with the store name from settings
export function Markdown({ source, siteName = '' }: { source: string; siteName?: string }) {
  return (
    <div className="space-y-4 text-pretty leading-relaxed">
      {parseMarkdown(source.replaceAll('{siteName}', siteName)).map((block, i) => {
        if (block.type === 'ul') {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground">
              {block.items.map((item, j) => (
                <li key={j}>
                  <InlineText parts={item} />
                </li>
              ))}
            </ul>
          )
        }
        if (block.type === 'h2') {
          return (
            <h2 key={i} className="pt-4 font-semibold text-xl tracking-tight">
              <InlineText parts={block.content} />
            </h2>
          )
        }
        if (block.type === 'h3') {
          return (
            <h3 key={i} className="pt-2 font-semibold text-lg">
              <InlineText parts={block.content} />
            </h3>
          )
        }
        return (
          <p key={i} className="text-foreground/80">
            <InlineText parts={block.content} />
          </p>
        )
      })}
    </div>
  )
}
