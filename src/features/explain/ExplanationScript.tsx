import { useStageContext } from './contexts/stageContext'

type Segment = { text: string; cue?: string }

const CUE_RE = /\{\{([^|]+)\|([^}]+)\}\}/g

function parse(description: string): Segment[] {
  const segments: Segment[] = []
  let last = 0
  for (const match of description.matchAll(CUE_RE)) {
    const [raw, cue, text] = match
    if (match.index > last)
      segments.push({ text: description.slice(last, match.index) })
    segments.push({ text, cue })
    last = match.index + raw.length
  }
  if (last < description.length)
    segments.push({ text: description.slice(last) })
  return segments
}

const parseLines = (description: string): Segment[][] =>
  description.split('\n').map(parse)

export default function ExplanationScript() {
  const { currentScene, goToCue } = useStageContext()
  if (!currentScene.title) return null

  return (
    <div
      role="article"
      aria-label="Explanation"
      className="mt-2 flex min-h-0 flex-1 flex-col rounded bg-bg-sunken p-3 font-main text-sm leading-relaxed text-fg shadow-press"
    >
      <h2 className="mb-1 shrink-0 font-semibold">{currentScene.title}</h2>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {parseLines(currentScene.explanation).map((line, lineIdx) => (
          <p key={lineIdx}>
            {line.map((seg, i) =>
              seg.cue ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToCue(seg.cue!)}
                  className="cursor-pointer rounded-sm text-accent underline decoration-dotted underline-offset-2 hover:bg-accent/10"
                >
                  {seg.text}
                </button>
              ) : (
                <span key={i}>{seg.text}</span>
              )
            )}
          </p>
        ))}
      </div>
    </div>
  )
}
