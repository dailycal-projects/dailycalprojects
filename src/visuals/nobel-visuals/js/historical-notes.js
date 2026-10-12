import { labNote, manhattanNote } from '../notes';

export default function initialize({ shared }) {
  const info = labNote;
  const pattern =
    /Lawrence Berkeley National Lab(?:oratory)?|Lawrence Radiation Laboratory|Radiation Lab(?:oratory)?|Rad Lab|Berkeley Lab/g;

  const notes = [
    { pattern, info, className: 'lab-mention' },
    {
      pattern: /\bManhattan Project\b/gi,
      info: manhattanNote,
      className: 'manhattan-mention',
    },
  ];

  function markMentions(root, { pattern, info, className }) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.parentElement?.closest(
          '.lab-mention, .manhattan-mention, script, style, svg',
        )
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const text = node.nodeValue;
      pattern.lastIndex = 0;
      if (!pattern.test(text)) return;
      const fragment = document.createDocumentFragment();
      let last = 0;
      text.replace(pattern, (match, index) => {
        const mark = document.createElement('mark');
        mark.className = className;
        mark.textContent = match;
        mark.dataset.info = info;
        mark.tabIndex = 0;
        fragment.append(text.slice(last, index), mark);
        last = index + match.length;
      });
      fragment.append(text.slice(last));
      node.replaceWith(fragment);
    });
  }

  function markHistoricalMentions(root) {
    notes.forEach((note) => markMentions(root, note));
  }

  shared.markHistoricalMentions = markHistoricalMentions;
}
