'use client';

/**
 * Simple Markdown renderer — no external dependencies
 * Handles: headings, bold, italic, lists, code blocks, blockquotes, links, hr
 */
export default function Markdown({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.trim().startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={elements.length} className="bg-gray-900 text-gray-100 rounded-lg p-4 my-3 overflow-x-auto text-xs font-mono leading-relaxed">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={elements.length} className="my-4 border-gray-200" />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('#### ')) {
      elements.push(<h4 key={elements.length} className="font-semibold text-sm mt-4 mb-1">{renderInline(line.slice(5))}</h4>);
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={elements.length} className="font-semibold text-sm mt-4 mb-2">{renderInline(line.slice(4))}</h3>);
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={elements.length} className="font-bold text-base mt-4 mb-2">{renderInline(line.slice(3))}</h2>);
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={elements.length} className="font-bold text-lg mt-4 mb-2">{renderInline(line.slice(2))}</h1>);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines = [line.slice(2)];
      i++;
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={elements.length} className="border-l-3 border-brand-300 pl-3 my-2 text-gray-600 italic">
          {quoteLines.map((ql, j) => <p key={j}>{renderInline(ql)}</p>)}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    if (/^[\-\*] /.test(line.trim())) {
      const listItems = [];
      while (i < lines.length && /^[\-\*] /.test(lines[i].trim())) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={elements.length} className="my-2 ml-4 space-y-1">
          {listItems.map((item, j) => (
            <li key={j} className="flex gap-2">
              <span className="text-brand-400 mt-1.5 shrink-0">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line.trim())) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={elements.length} className="my-2 ml-4 space-y-1">
          {listItems.map((item, j) => (
            <li key={j} className="flex gap-2">
              <span className="text-brand-500 font-medium shrink-0">{j + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(<p key={elements.length} className="my-1.5">{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

/**
 * Render inline markdown: bold, italic, code, links
 */
function renderInline(text) {
  if (!text) return text;

  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline code
    let match = remaining.match(/^(.*?)`([^`]+)`(.*)$/);
    if (match) {
      if (match[1]) parts.push(<span key={key++}>{renderInline(match[1])}</span>);
      parts.push(<code key={key++} className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-xs font-mono">{match[2]}</code>);
      remaining = match[3];
      continue;
    }

    // Bold
    match = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/);
    if (match) {
      if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
      remaining = match[3];
      continue;
    }

    // Italic
    match = remaining.match(/^(.*?)\*(.+?)\*(.*)$/);
    if (match) {
      if (match[1]) parts.push(<span key={key++}>{match[1]}</span>);
      parts.push(<em key={key++}>{match[2]}</em>);
      remaining = match[3];
      continue;
    }

    // No more matches — push remaining text
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts.length === 1 ? parts[0] : parts;
}
