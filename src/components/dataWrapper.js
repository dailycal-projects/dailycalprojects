import { useEffect, useState, useCallback, useRef } from 'react'

const iframeStyle = {
  overflow: "hidden",
  border: "none"
}

/**
 * An element for importing a DataWrapper Chart element, from its chart id.
 * This is based of a npm package called 'react-datawrapper-chart', which is no longer maintained and
 * does not support the newest version of React.
 * 
 * Original source: https://github.com/sto3psl/react-datawrapper-chart/blob/main/src/index.js
 * (Under the ISC License as of February 26th, 2026)
 */
export default function DatawrapperChart({ chartId }) {
  const iframeRef = useRef()
  const [height, setState] = useState(500)
  const src = `//datawrapper.dwcdn.net/${chartId}`;

  const onMessage = useCallback(
    ({ data = {}, source }) => {
      if (
        source !== iframeRef.current.contentWindow ||
        typeof data === 'string' ||
        !data['datawrapper-height']
      )
        return

      setState(Object.values(data['datawrapper-height'])[0])
    },
    [setState, iframeRef]
  )

  useEffect(() => {
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [height, setState, onMessage])

  return (
    <iframe
      ref={iframeRef}
      style={iframeStyle}
      width="100%"
      src={src}
      height={height}
    />
  )
}
