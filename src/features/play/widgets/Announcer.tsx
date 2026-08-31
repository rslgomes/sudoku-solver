import { useController } from '../contexts/playControllerContext'

export default function Announcer() {
  const { announcement } = useController()

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {announcement}
    </div>
  )
}
