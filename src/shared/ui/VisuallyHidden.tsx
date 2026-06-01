// import { useEffect, useState } from 'react'

/*
 *  THIS COMPONENT IS COPIED FROM JOSH COMEAU'S Goodies.
 *  https://www.joshwcomeau.com/snippets/react-components/visually-hidden/
 *  if you don't know him, you should. He is a great developer and teacher
 */

export default function VisuallyHidden({
  children,
  ...delegated
}: {
  children: React.ReactNode
}) {
  // const [forceShow, setForceShow] = useState(false)

  // useEffect(()=> {
  // stub, will add alt to show funcionallity when I need it
  // },[])

  // if (forceShow) return children

  return (
    <span
      className="absolute w-1 h-1 overflow-hidden whitespace-nowrap [clip:rect(0,0,0,0)] [clip-path:inset(50%)]"
      {...delegated}
    >
      {children}
    </span>
  )
}
