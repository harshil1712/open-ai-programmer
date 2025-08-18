"use client";

import { cn } from "@/lib/utils";
import type { ComponentProps, HTMLAttributes } from "react";
import { isValidElement, memo, useEffect, useState } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock, CodeBlockCopyButton } from "./code-block";
import "katex/dist/katex.min.css";
import hardenReactMarkdown from "harden-react-markdown";

function parseAIResponse(response: string) {
  const sections = {
    files: [] as Array<{ path: string; content: string }>,
  };

  // Skip processing for very large responses to avoid performance issues
  if (response.length > 50000) {
    return sections;
  }

  // Parse file sections - handle duplicates and prefer complete versions
  const fileMap = new Map<string, { content: string; isComplete: boolean }>();

  const fileRegex = /<file path="([^"]+)">([\s\S]*?)(?:<\/file>|$)/g;
  let match;
  while ((match = fileRegex.exec(response)) !== null) {
    const filePath = match[1];
    const content = match[2].trim();
    const hasClosingTag = match[0].includes("</file>");

    // Check if this file already exists in our map
    const existing = fileMap.get(filePath);

    // Simplified replacement logic - prefer complete files or longer content
    const shouldReplace = !existing || 
      (!existing.isComplete && hasClosingTag) ||
      (hasClosingTag && content.length > existing.content.length);

    if (shouldReplace) {
      // Skip validation for performance - trust the content
      fileMap.set(filePath, { content, isComplete: hasClosingTag });
    }
  }

  // Convert map to array for sections.files
  sections.files = Array.from(fileMap.entries()).map(([path, { content }]) => ({
    path,
    content,
  }));

  return sections;
}

/**
 * Parses markdown text and removes incomplete tokens to prevent partial rendering
 * of links, images, bold, and italic formatting during streaming.
 */
function parseIncompleteMarkdown(text: string): string {
  if (!text || typeof text !== "string" || text.length < 2) {
    return text;
  }

  // For very large texts, skip processing to avoid performance issues
  if (text.length > 10000) {
    return text;
  }

  let result = text;

  // Handle incomplete links and images - simple end check
  if (result.endsWith('[') || result.endsWith('![')) {
    const lastBracket = result.lastIndexOf('[');
    result = result.substring(0, lastBracket);
  }

  // Simple pattern counting - much faster than complex regex
  const patterns = [
    { marker: '**', endPattern: /\*\*[^*]*?$/ },
    { marker: '__', endPattern: /__[^_]*?$/ },
    { marker: '~~', endPattern: /~~[^~]*?$/ }
  ];

  for (const { marker, endPattern } of patterns) {
    const count = (result.match(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count % 2 === 1 && endPattern.test(result)) {
      result = `${result}${marker}`;
    }
  }

  // Handle single character markers more efficiently
  if (result.endsWith('*') && !result.endsWith('**')) {
    const asteriskCount = (result.match(/(?<!\*)\*(?!\*)/g) || []).length;
    if (asteriskCount % 2 === 1) {
      result = `${result}*`;
    }
  }

  if (result.endsWith('_') && !result.endsWith('__')) {
    const underscoreCount = (result.match(/(?<!_)_(?!_)/g) || []).length;
    if (underscoreCount % 2 === 1) {
      result = `${result}_`;
    }
  }

  // Handle backticks - simplified logic
  if (result.endsWith('`') && !result.endsWith('```')) {
    const tripleBacktickCount = (result.match(/```/g) || []).length;
    if (tripleBacktickCount % 2 === 0) { // Not inside code block
      const singleBacktickCount = (result.match(/(?<!`)(?<!``)`(?!`)(?!``)/g) || []).length;
      if (singleBacktickCount % 2 === 1) {
        result = `${result}\``;
      }
    }
  }

  return result;
}

// Create a hardened version of ReactMarkdown
const HardenedMarkdown = hardenReactMarkdown(ReactMarkdown);

export type ResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options["children"];
  allowedImagePrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["allowedImagePrefixes"];
  allowedLinkPrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["allowedLinkPrefixes"];
  defaultOrigin?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["defaultOrigin"];
  parseIncompleteMarkdown?: boolean;
};

const components: Options["components"] = {
  ol: ({ node, children, className, ...props }) => (
    <ol className={cn("ml-4 list-outside list-decimal", className)} {...props}>
      {children}
    </ol>
  ),
  li: ({ node, children, className, ...props }) => (
    <li className={cn("py-1", className)} {...props}>
      {children}
    </li>
  ),
  ul: ({ node, children, className, ...props }) => (
    <ul className={cn("ml-4 list-outside list-disc", className)} {...props}>
      {children}
    </ul>
  ),
  hr: ({ node, className, ...props }) => (
    <hr className={cn("my-6 border-border", className)} {...props} />
  ),
  strong: ({ node, children, className, ...props }) => (
    <span className={cn("font-semibold", className)} {...props}>
      {children}
    </span>
  ),
  a: ({ node, children, className, ...props }) => (
    <a
      className={cn("font-medium text-primary underline", className)}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),
  h1: ({ node, children, className, ...props }) => (
    <h1
      className={cn("mt-6 mb-2 font-semibold text-3xl", className)}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ node, children, className, ...props }) => (
    <h2
      className={cn("mt-6 mb-2 font-semibold text-2xl", className)}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, className, ...props }) => (
    <h3 className={cn("mt-6 mb-2 font-semibold text-xl", className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ node, children, className, ...props }) => (
    <h4 className={cn("mt-6 mb-2 font-semibold text-lg", className)} {...props}>
      {children}
    </h4>
  ),
  h5: ({ node, children, className, ...props }) => (
    <h5
      className={cn("mt-6 mb-2 font-semibold text-base", className)}
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ node, children, className, ...props }) => (
    <h6 className={cn("mt-6 mb-2 font-semibold text-sm", className)} {...props}>
      {children}
    </h6>
  ),
  table: ({ node, children, className, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table
        className={cn("w-full border-collapse border border-border", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ node, children, className, ...props }) => (
    <thead className={cn("bg-muted/50", className)} {...props}>
      {children}
    </thead>
  ),
  tbody: ({ node, children, className, ...props }) => (
    <tbody className={cn("divide-y divide-border", className)} {...props}>
      {children}
    </tbody>
  ),
  tr: ({ node, children, className, ...props }) => (
    <tr className={cn("border-border border-b", className)} {...props}>
      {children}
    </tr>
  ),
  th: ({ node, children, className, ...props }) => (
    <th
      className={cn("px-4 py-2 text-left font-semibold text-sm", className)}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ node, children, className, ...props }) => (
    <td className={cn("px-4 py-2 text-sm", className)} {...props}>
      {children}
    </td>
  ),
  blockquote: ({ node, children, className, ...props }) => (
    <blockquote
      className={cn(
        "my-4 border-muted-foreground/30 border-l-4 pl-4 text-muted-foreground italic",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ node, className, ...props }) => {
    const inline = node?.position?.start.line === node?.position?.end.line;

    if (!inline) {
      return <code className={className} {...props} />;
    }

    return (
      <code
        className={cn(
          "rounded bg-muted px-1.5 py-0.5 font-mono text-sm",
          className
        )}
        {...props}
      />
    );
  },
  pre: ({ node, className, children }) => {
    let language = "javascript";

    if (typeof node?.properties?.className === "string") {
      language = node.properties.className.replace("language-", "");
    }

    // Extract code content from children safely
    let code = "";
    if (
      isValidElement(children) &&
      children.props &&
      typeof children.props.children === "string"
    ) {
      code = children.props.children;
    } else if (typeof children === "string") {
      code = children;
    }

    return (
      <CodeBlock
        className={cn("my-4 h-auto", className)}
        code={code}
        language={language}
      >
        <CodeBlockCopyButton
          onCopy={() => console.log("Copied code to clipboard")}
          onError={() => console.error("Failed to copy code to clipboard")}
        />
      </CodeBlock>
    );
  },
};

export const Response = memo(
  ({
    className,
    options,
    children,
    allowedImagePrefixes,
    allowedLinkPrefixes,
    defaultOrigin,
    parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
    ...props
  }: ResponseProps) => {
    // Parse the children to remove incomplete markdown tokens if enabled
    const parsedChildren =
      typeof children === "string" && shouldParseIncompleteMarkdown
        ? parseIncompleteMarkdown(children)
        : children;

    // Parse AI response to extract file tags if children is a string
    const aiResponse =
      typeof parsedChildren === "string"
        ? parseAIResponse(parsedChildren)
        : null;

    // Remove file tags from the text content for markdown rendering
    const textContent =
      typeof parsedChildren === "string" && aiResponse
        ? parsedChildren
            .replace(/<file path="[^"]+">[\s\S]*?<\/file>/g, "")
            .trim()
        : parsedChildren;

    return (
      <div
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className
        )}
        {...props}
      >
        {textContent && (
          <HardenedMarkdown
            allowedImagePrefixes={allowedImagePrefixes ?? ["*"]}
            allowedLinkPrefixes={allowedLinkPrefixes ?? ["*"]}
            components={components}
            defaultOrigin={defaultOrigin}
            rehypePlugins={[]}
            remarkPlugins={[remarkGfm, remarkMath]}
            {...options}
          >
            {textContent}
          </HardenedMarkdown>
        )}

        {/* Render extracted file code blocks */}
        {aiResponse?.files.map((file, index) => {
          const language = file.path.split(".").pop() || "text";
          const languageMap: Record<string, string> = {
            tsx: "typescript",
            ts: "typescript",
            js: "javascript",
            jsx: "javascript",
            css: "css",
            json: "json",
            html: "html",
            md: "markdown",
          };

          return (
            <div key={index} className="my-4">
              <div className="text-sm text-muted-foreground mb-2 font-mono">
                {file.path}
              </div>
              <CodeBlock
                code={file.content}
                language={languageMap[language] || language}
                showLineNumbers={true}
              >
                <CodeBlockCopyButton />
              </CodeBlock>
            </div>
          );
        })}
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
