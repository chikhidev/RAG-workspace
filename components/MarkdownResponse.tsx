import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Info, AlertTriangle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface MarkdownResponseProps {
  content: string;
  className?: string;
}

const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Inline code
  if (inline) {
    return (
      <code 
        className="bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded font-mono text-[0.9em] border border-orange-500/20" 
        {...props}
      >
        {children}
      </code>
    );
  }

  // Block code
  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-gray-800 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-gray-800">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider font-bold">
          {lang || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-orange-400"
          aria-label="Copy code"
        >
          {copied ? (
            <Check size={14} className="text-orange-400" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          style={oneDark}
          language={lang || 'text'}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: '#131313ff',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }
          }}
          {...props}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const Blockquote = ({ children }: any) => {
  // Detect callout types from first line
  const firstChild = React.Children.toArray(children)[0];
  let calloutType = 'info';
  let content = children;

  if (React.isValidElement(firstChild)) {
    const text = String((firstChild.props as any).children || '');
    const calloutMatch = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
    
    if (calloutMatch) {
      calloutType = calloutMatch[1].toLowerCase();
      // Remove the callout indicator from content
      content = React.cloneElement(firstChild as any, {
        children: text.replace(/^\[!.*?\]\s*/, '')
      });
    }
  }

  const calloutStyles: Record<string, { bg: string; border: string; icon: any; iconColor: string; title: string }> = {
    note: {
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/30',
      icon: Info,
      iconColor: 'text-blue-400',
      title: 'Note'
    },
    tip: {
      bg: 'bg-orange-500/5',
      border: 'border-orange-500/30',
      icon: Lightbulb,
      iconColor: 'text-orange-400',
      title: 'Tip'
    },
    important: {
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/30',
      icon: CheckCircle2,
      iconColor: 'text-purple-400',
      title: 'Important'
    },
    warning: {
      bg: 'bg-yellow-500/5',
      border: 'border-yellow-500/30',
      icon: AlertTriangle,
      iconColor: 'text-yellow-400',
      title: 'Warning'
    },
    caution: {
      bg: 'bg-red-500/5',
      border: 'border-red-500/30',
      icon: XCircle,
      iconColor: 'text-red-400',
      title: 'Caution'
    }
  };

  const style = calloutStyles[calloutType] || calloutStyles.note;
  const Icon = style.icon;

  return (
    <blockquote className={`my-4 rounded-xl border ${style.border} ${style.bg} p-4 not-italic`}>
      <div className="flex gap-3">
        <Icon size={18} className={`${style.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1 space-y-2">
          <div className={`font-bold text-sm ${style.iconColor}`}>{style.title}</div>
          <div className="text-gray-300 text-[13px] leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
            {content}
          </div>
        </div>
      </div>
    </blockquote>
  );
};

const Table = ({ children }: any) => {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
};

const TableHead = ({ children }: any) => {
  return (
    <thead className="bg-gray-900/50">
      {children}
    </thead>
  );
};

const TableRow = ({ children, isHeader }: any) => {
  return (
    <tr className={`border-b border-gray-800 last:border-0 ${!isHeader && 'hover:bg-gray-900/30 transition-colors'}`}>
      {children}
    </tr>
  );
};

const TableCell = ({ children, isHeader }: any) => {
  const Tag = isHeader ? 'th' : 'td';
  return (
    <Tag className={`px-4 py-3 text-left text-[13px] ${isHeader ? 'font-bold text-gray-200' : 'text-gray-300'}`}>
      {children}
    </Tag>
  );
};

const TaskListItem = ({ checked, children }: any) => {
  return (
    <li className="flex items-start gap-3 py-1">
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-900 text-orange-500 focus:ring-orange-500 focus:ring-offset-0"
      />
      <span className={`flex-1 ${checked ? 'line-through text-gray-500' : 'text-gray-300'}`}>
        {children}
      </span>
    </li>
  );
};

export const MarkdownResponse: React.FC<MarkdownResponseProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-response ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mt-8 mb-4 pb-2 border-b-2 border-gray-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-white mt-6 mb-3 pb-2 border-b border-gray-800">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-gray-100 mt-5 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-bold text-gray-200 mt-4 mb-2">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-bold text-gray-300 mt-3 mb-2">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-bold text-gray-400 mt-3 mb-2 uppercase tracking-wide">
              {children}
            </h6>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="text-gray-300 text-[14px] leading-relaxed mb-4">
              {children}
            </p>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 underline decoration-orange-400/30 hover:decoration-orange-300 transition-colors"
            >
              {children}
            </a>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="space-y-2 mb-4 ml-6 text-gray-300 text-[14px] list-disc marker:text-orange-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-4 ml-6 text-gray-300 text-[14px] list-decimal marker:text-orange-500 marker:font-bold">
              {children}
            </ol>
          ),
          li: ({ children, className, ...props }: any) => {
            // Handle task list items
            const isTask = className?.includes('task-list-item');
            if (isTask) {
              const checked = props.checked ?? false;
              return <TaskListItem checked={checked}>{children}</TaskListItem>;
            }
            return <li className="leading-relaxed" {...props}>{children}</li>;
          },

          // Code
          code: CodeBlock,

          // Blockquotes
          blockquote: Blockquote,

          // Tables
          table: Table,
          thead: TableHead,
          tbody: ({ children }: any) => <tbody>{children}</tbody>,
          tr: ({ children }: any) => <TableRow>{children}</TableRow>,
          th: ({ children }: any) => <TableCell isHeader>{children}</TableCell>,
          td: ({ children }: any) => <TableCell>{children}</TableCell>,

          // Horizontal Rule
          hr: () => (
            <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          ),

          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-bold text-white">
              {children}
            </strong>
          ),

          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-gray-200">
              {children}
            </em>
          ),

          // Strikethrough
          del: ({ children }) => (
            <del className="line-through text-gray-500">
              {children}
            </del>
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-xl max-w-full h-auto my-4 border border-gray-800 shadow-lg"
            />
          ),

          // Subscript
          sub: ({ children }) => (
            <sub className="text-[0.8em]">{children}</sub>
          ),

          // Superscript
          sup: ({ children }) => (
            <sup className="text-[0.8em]">{children}</sup>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownResponse;