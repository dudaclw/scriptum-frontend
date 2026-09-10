'use client';

import { Highlight, themes } from 'prism-react-renderer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

type MarkdownPreviewProps = {
  content: string;
  className?: string;
};

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div className={cn('prose dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // O react-markdown v10 não passa mais a flag `inline`: um bloco de
          // código cercado chega com a classe `language-*`, o code inline não.
          code({ className, children, ...props }) {
            const language = /language-(\w+)/.exec(className || '')?.[1];

            if (!language) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            return (
              <Highlight
                code={String(children).replace(/\n$/, '')}
                language={language}
                theme={themes.vsDark}
              >
                {({
                  className: preClassName,
                  style,
                  tokens,
                  getLineProps,
                  getTokenProps,
                }) => (
                  <pre
                    className={cn(
                      preClassName,
                      'overflow-x-auto rounded-lg p-4 text-sm',
                    )}
                    style={style}
                  >
                    {tokens.map((line, lineIndex) => (
                      <div
                        key={`line-${lineIndex}`}
                        {...getLineProps({ line })}
                      >
                        {line.map((token, tokenIndex) => (
                          <span
                            key={`token-${lineIndex}-${tokenIndex}`}
                            {...getTokenProps({ token })}
                          />
                        ))}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            );
          },
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
