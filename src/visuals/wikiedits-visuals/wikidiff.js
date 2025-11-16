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
      padding: '10px 20px',
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

    diffContainer: {
      padding: '20px 40px',
      margin: '10px 0',
      // background: "red",
    },
  };

  const outside = {
    // background: "red",
    // padding: "5px"
  };

  return (
    <div style={{
      // background: "grey"
      boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
      // color: "grey",
      // fontSize: "12px",
      // fontWeight: "bold",
      padding: '10px 20px',
    }}
    >
      <span style={{ color: 'grey', fontSize: '12px', fontFamily: 'sans-serif' }}>
        <b>{diffs[diff_id].name}</b>
        {' '}
        on Wikipedia - Edit on
        {' '}
        {diffs[diff_id].time}
        {' '}
        -
        {' '}
        <a href={diffs[diff_id].article} target="_blank" rel="noreferrer">Diff</a>
      </span>
      <div style={{ boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)' }}>
        <ReactDiffViewer
          oldValue={diffs[diff_id].old}
          newValue={diffs[diff_id].new}
          splitView={false}
          hideLineNumbers
          hideMarkers
          styles={newStyles}
        />
      </div>
    </div>
  );
}

export default Wikidiff;
