import React from "react";

/**
 * Injects variables into all the child elements of this tag.
 */
export const ScopeInjector = ({ children, scope = {} }) => {
  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { ...scope });
    }
    return child;
  });
};
