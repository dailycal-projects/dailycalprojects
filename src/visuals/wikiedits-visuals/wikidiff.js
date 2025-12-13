import React from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
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
      boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
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
        <a href={diffs[diff_id].article} target="_blank" rel="noreferrer">Full Diff</a>
        {diffs[diff_id].refs_hidden && <i style={{ color: 'grey', fontSize: '12px', fontFamily: 'sans-serif' }}> - References hidden</i>}
      </span>
      <div style={{ boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)' }}>
        {diffs[diff_id].raw ? (
          <div
            style={{
              fontFamily: 'monospace, monospace',
              fontSize: '16px',
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '6px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginTop: "1rem",
              maxHeight: "50vh",
              overflow: "scroll"
            }}
          >
            {(diffs[diff_id].new || '').replace(/<br\s*\/?>/g, '')}
          </div>
        ) : (
          <ReactDiffViewer
            oldValue={diffs[diff_id].old}
            newValue={diffs[diff_id].new}
            splitView={!diffs[diff_id].intro}
            hideLineNumbers
            hideMarkers
            styles={newStyles}
            compareMethod={DiffMethod.LINES}
          />
        )}
      </div>
    </div>
  );
}

export default Wikidiff;
