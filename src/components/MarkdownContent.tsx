import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  className?: string;
  onZoomImage?: (src: string, alt?: string) => void;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  className = "",
  onZoomImage,
}) => {
  if (!content) return null;

  return (
    <div className={`markdown-content leading-relaxed break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold my-2 text-slate-900">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold my-1.5 text-slate-900">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-semibold my-1 text-slate-900">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="my-1.5 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 text-left inline-block w-full">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 text-left inline-block w-full">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-extrabold text-purple-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-purple-400 pl-3 my-2 italic text-slate-600 text-left bg-purple-50/40 py-1 rounded-r-xl">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isMultiline = typeof children === "string" && children.includes("\n");
            if (!codeClassName && !isMultiline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-purple-100/80 text-purple-950 font-mono text-[0.88em] border border-purple-200/60 font-semibold"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3.5 my-2.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto text-left border border-slate-800 shadow-inner">
                <code className="text-slate-100 font-mono text-xs" {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 text-left">
              <table className="min-w-full divide-y divide-purple-200 border border-purple-100 rounded-xl text-xs overflow-hidden">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 bg-purple-50 font-bold text-purple-900 border-b border-purple-200 text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-purple-50 text-slate-700">
              {children}
            </td>
          ),
          img: ({ src, alt, ...props }) => (
            <span className="my-2.5 flex flex-col items-center justify-center">
              <img
                src={src}
                alt={alt || "Imagen"}
                className="max-h-60 sm:max-h-72 w-auto max-w-full rounded-2xl object-contain border border-purple-100 shadow-sm bg-white p-1 hover:shadow-md transition-all cursor-zoom-in"
                loading="lazy"
                onClick={(e) => {
                  e.stopPropagation();
                  if (src && onZoomImage) {
                    onZoomImage(src, alt);
                  }
                }}
                {...props}
              />
              {alt && alt !== "Imagen" && alt !== "image" && (
                <span className="text-[11px] text-slate-400 mt-1 italic text-center block">
                  {alt}
                </span>
              )}
            </span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
