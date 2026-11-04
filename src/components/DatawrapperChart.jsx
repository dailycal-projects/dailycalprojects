import { useEffect, useRef, useState, useCallback } from "react";

// Check if a CSS style object impacts the margin-bottom.
function styleSetsMarginBottom(style) {
  if (!style) {
    return false;
  }

  const { marginBottom, margin, marginBlockEnd } = style;

  if (marginBottom !== undefined && marginBottom !== null && marginBottom !== "") {
    return true;
  }

  if (margin !== undefined && margin !== null && margin !== "") {
    return true;
  }

  if (marginBlockEnd !== undefined && marginBlockEnd !== null && marginBlockEnd !== "") {
    return true;
  }

  return false;
}

// Sets the CSS margin bottom styling if it is not already specified in the given style object.
function iframeStyle(style, marginBottom = "20px") {
  if (styleSetsMarginBottom(style)) {
    return style;
  }

  return { marginBottom, ...style };
}

export default function DatawrapperChart({ title, chartId, height = 500, style, ...props }) {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState(height);

  const src = `https://datawrapper.dwcdn.net/${chartId}`;

  // Listen for messages if the size changes
  const onMessage = useCallback((event) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    if (event.source !== iframe.contentWindow) return;

    const data = event.data;
    if (typeof data !== "object" || !data || !data["datawrapper-height"]) {
      return;
    }

    const newHeight = Number(Object.values(data["datawrapper-height"])[0]);
    if (!Number.isNaN(newHeight)) {
      setIframeHeight(newHeight);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onMessage]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      src={src}
      width="100%"
      height={iframeHeight}
      scrolling="no"
      frameBorder="0"
      style={iframeStyle(style)}
      {...props}
    />
  );
}
