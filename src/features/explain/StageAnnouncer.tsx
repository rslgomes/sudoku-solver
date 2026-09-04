import { useStageContext } from './contexts/stageContext'

export default function StageAnnouncer() {
  const { announcement } = useStageContext()

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {announcement}
    </div>
  )
}
