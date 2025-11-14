import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import diffs from './diffdata';

function Wikidiff({ diff_id }) {
  const newStyles = {
    variables: {
      light: {
        // removedBackground: "red",
      },
    },
    line: {
    //   padding: "10px 2px",
      '&:hover': {
        // background: "#a26ea1",

      },
    },

    diffRemoved: {
      // color: "red",
      // background: "red",
      textDecoration: 'line-through',
      '&:hover': {
        textDecoration: 'none',
      },
    },

    gutter: {
      display: 'none',
    },
  };

  return (
    <ReactDiffViewer
      oldValue={diffs[diff_id].old}
      newValue={diffs[diff_id].new}
      splitView={false}
      hideLineNumbers
      styles={newStyles}
    />
  );
}

export default Wikidiff;
