import { Fragment } from 'react'

export type Block = { type: 'h2' | 'h3' | 'p'; text: string } | { type: 'ul'; items: string[] }

// The supported subset: ## and ### headings, - lists, **bold**, paragraphs split by blank lines
export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  const flush = () => {
    if (paragraph.length) blocks.push({ type: 'p', text: paragraph.join(' ') })
    paragraph = []
  }
  for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim()
    const heading = /^(#{2,3})\s+(.+)$/.exec(line)
    const item = /^-\s+(.+)$/.exec(line)
    if (!line) {
      flush()
    } else if (heading) {
      flush()
      blocks.push({
        type: heading[1] === '##' ? 'h2' : 'h3',
        text: heading[2],
      })
    } else if (item) {
      flush()
      const last = blocks.at(-1)
      if (last?.type === 'ul') last.items.push(item[1])
      else blocks.push({ type: 'ul', items: [item[1]] })
    } else {
      paragraph.push(line)
    }
  }
  flush()
  return blocks
}

// Splits on **bold** pairs; odd parts are bold
export const splitBold = (text: string) => text.split(/\*\*(.+?)\*\*/g)

function Inline({ text }: { text: string }) {
  return splitBold(text).map((part, i) =>
    // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional and never reorder
    i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>
  )
}

export function MarkdownPreview({ source, siteName }: { source: string; siteName: string }) {
  const blocks = parseMarkdown(source.replaceAll('{siteName}', siteName))
  if (!blocks.length) return <p className="text-muted-foreground">Nothing to preview yet.</p>
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        const key = `${block.type}-${i}`
        if (block.type === 'h2')
          return (
            <h2 key={key} className="pt-2 font-semibold text-lg">
              <Inline text={block.text} />
            </h2>
          )
        if (block.type === 'h3')
          return (
            <h3 key={key} className="pt-1 font-semibold text-base">
              <Inline text={block.text} />
            </h3>
          )
        if (block.type === 'ul')
          return (
            <ul key={key} className="list-disc space-y-1 pl-5">
              {block.items.map((item, j) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: list items have no id
                <li key={j}>
                  <Inline text={item} />
                </li>
              ))}
            </ul>
          )
        return (
          <p key={key}>
            <Inline text={block.text} />
          </p>
        )
      })}
    </div>
  )
}
