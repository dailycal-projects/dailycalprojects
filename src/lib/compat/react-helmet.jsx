/**
 * A stand-in for react-helmet's <Helmet>, which the visuals from the old Gatsby site use to add
 * tags to the page's <head> (e.g. a font preload) and attributes to <html>. react-helmet is
 * unmaintained and doesn't support React 19, so this does the same in the browser: each child
 * <link>, <meta>, <script> or <title> is added to <head>, and a child <html> sets its attributes on
 * the page's <html>, until the component unmounts. Nothing is rendered in place.
 */
import { Children, useEffect } from "react";

// React prop names that differ from their HTML attribute names
const ATTRIBUTE_NAMES = { className: "class", crossOrigin: "crossorigin", htmlFor: "for" };

function setAttributes(element, props) {
  for (const [name, value] of Object.entries(props)) {
    if (name === "children" || value === undefined || value === null || value === false) {
      continue;
    }
    element.setAttribute(ATTRIBUTE_NAMES[name] ?? name, value === true ? "" : String(value));
  }
}

export function Helmet({ children }) {
  useEffect(() => {
    const added = [];
    const htmlAttributes = [];

    Children.forEach(children, (child) => {
      if (!child || typeof child.type !== "string") {
        return;
      }

      if (child.type === "html") {
        for (const name of Object.keys(child.props)) {
          if (name === "children") {
            continue;
          }
          const attribute = ATTRIBUTE_NAMES[name] ?? name;
          htmlAttributes.push([attribute, document.documentElement.getAttribute(attribute)]);
        }
        setAttributes(document.documentElement, child.props);
        return;
      }

      const element = document.createElement(child.type);
      setAttributes(element, child.props);
      if (typeof child.props.children === "string") {
        element.textContent = child.props.children;
      }
      document.head.appendChild(element);
      added.push(element);
    });

    return () => {
      added.forEach((element) => element.remove());
      for (const [attribute, previous] of htmlAttributes) {
        if (previous === null) {
          document.documentElement.removeAttribute(attribute);
        } else {
          document.documentElement.setAttribute(attribute, previous);
        }
      }
    };
  }, [children]);

  return null;
}

export default Helmet;
