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
    <div
      style={{
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
        padding: '10px 20px',
        marginBottom: '1rem',
      }}
    >
      <style>
        {`
          /* Adjust line content padding in react-diff-viewer (inner wrapper)*/
          .react-diff-pa3tg-content-text {
            padding: 10px 10px;
          }

          /*Override and set to 0 for consistency (outer wrapper) */
          .react-diff-vl0irh-content,
          .react-diff-vl0irh-content.react-diff-1fqrsd-diff-added,
          .react-diff-vl0irh-content.react-diff-26ieb0-diff-removed {
            padding: 0px 0px;
          }
        `}
      </style>
      <span
        style={{ color: 'grey', fontSize: '12px', fontFamily: 'sans-serif' }}
      >
        <b>{diffs[diff_id].name}</b>
        {' '}
        on Wikipedia - Edit on
        {' '}
        {diffs[diff_id].time}
        {' '}
        -
        {' '}
        <a href={diffs[diff_id].article} target="_blank" rel="noreferrer">
          Full Diff
        </a>
        {diffs[diff_id].refs_hidden && (
          <i
            style={{
              color: 'grey',
              fontSize: '12px',
              fontFamily: 'sans-serif',
            }}
          >
            {' '}
            - References hidden
          </i>
        )}
      </span>
      {/* Legend for diff colors */}
      <div style={{
        margin: '10px 0 10px 0', fontSize: '13px', fontFamily: 'sans-serif', display: 'flex', gap: '20px',
      }}
      >
        {diffs[diff_id].legend_delete && (
          <span>
            <span
              style={{
                display: 'inline-block',
                background: '#ffcccc',
                // background: '#ffeef0', // actual color of deletions is #ffeef0
                color: '#900',
                borderRadius: '4px',
                padding: '2px 8px',
                marginRight: '4px',
                border: '1px solid #f99',
                fontFamily: 'monospace',
              }}
            >
              Deletion
            </span>
            <span style={{ color: 'grey' }}>= removed text</span>
          </span>
        )}
        {diffs[diff_id].legend_add && (
          <span>
            <span
              style={{
                display: 'inline-block',
                background: '#ccffcc',
                // background: '#e6ffed', // actual color of additions is #e6ffed
                color: '#135c17',
                borderRadius: '4px',
                padding: '2px 8px',
                marginRight: '4px',
                border: '1px solid #8f8',
                fontFamily: 'monospace',
              }}
            >
              Addition
            </span>
            <span style={{ color: 'grey' }}>= added text</span>
          </span>
        )}
      </div>
      <div style={{ boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)' }}>
        {diffs[diff_id].raw ? (
          <div
            style={{
              fontFamily: 'monospace, monospace',
              fontSize: '16px',
              background: '#f5f5f5',
              padding: '10px',
              borderRadius: '6px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginTop: '1rem',
              maxHeight: '50vh',
              overflowY: 'scroll',
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
            disableWordDiff={!diffs[diff_id].words}
            hideMarkers
            styles={newStyles}
            compareMethod={diffs[diff_id].words ? DiffMethod.WORDS_WITH_SPACE : DiffMethod.LINES}
          />
        )}
      </div>
    </div>
  );
}

export default Wikidiff;
