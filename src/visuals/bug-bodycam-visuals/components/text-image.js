import React from "react"

export const TextImage = ({
  text,
  imageSrc,
  imageAlt = "",
  children,
  className = "",
  // Desktop: paragraph left, image right.
  // Mobile: image stacks above the paragraph.
  imageWidth = "50%",
}) => {
  const content = children ?? text

  if (!imageSrc || content == null) return null

  return (
    <div data-text-image-root className={className}>
      <style>{`
        [data-text-image-root]{
          display:flex;
          align-items:flex-start;
          gap:24px;
          margin-bottom: 15px;
        }
        [data-text-image-root] .ti-text{
          flex:1;
          margin:0;
          color: black;
          line-height:1.55;
        }
        [data-text-image-root] .ti-imageWrap{
          flex: 0 0 auto;
          width: ${imageWidth};
        }
        [data-text-image-root] .ti-image{
          display:block;
          width:100%;
          height:auto;
          border-radius:0px;
          object-fit:cover;
          margin-bottom: 0px;
        }

        @media (max-width: 599px){
          [data-text-image-root]{
            flex-direction:column;
            gap:12px;
          }
          [data-text-image-root] .ti-imageWrap{
            width:100%;
            order:-1; /* Image above the paragraph on mobile */
          }
        }

      `}</style>

      <p className="ti-text">{content}</p>

      {imageSrc && (
        <div className="ti-imageWrap">
          <img
            className="ti-image"
            src={imageSrc}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
          />
          <b
            className="ti-contrib"
            style={{
              fontSize: "12px",
              fontFamily:
                "Candal, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            Hayes Gaboury | File
          </b>
        </div>
      )}
    </div>
  )
}
