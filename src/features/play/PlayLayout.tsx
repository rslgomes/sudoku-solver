import Puzzle from './Puzzle'
import Toolbox from './Toolbox'
import Pad from './Pad'

export type { PlayController } from './types'

export default function PlayLayout() {
  return (
    <div>
      <div className="mt-4 grid w-full max-w-lg mx-auto content-start gap-2 grid-cols-[1fr_auto] [grid-template-areas:'puzzle_toolbox']">
        <Puzzle className="[grid-area:puzzle]" />
        <Toolbox className="[grid-area:toolbox] ml-2" />
      </div>
      <Pad className="mt-3" />
    </div>
  )
}
