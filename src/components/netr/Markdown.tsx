import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sm max-w-none text-foreground prose-headings:font-display prose-headings:tracking-tight prose-p:my-2 prose-li:my-0.5 prose-strong:text-foreground prose-a:text-saffron prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:text-[0.85em] prose-pre:bg-secondary/70 dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...rest }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
