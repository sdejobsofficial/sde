import { cn } from "@/lib/utils";

type TextMark = { Type: "bold" | "italic" | "code" };

type TextNode = {
  Type: "text";
  Text?: string;
  Marks?: TextMark[];
};

type HeadingNode = {
  Type: "heading";
  Attrs?: { level?: number };
  Content?: DescriptionNode[];
};

type ParagraphNode = {
  Type: "paragraph";
  Content?: DescriptionNode[];
};

type ListItemNode = {
  Type: "listItem";
  Content?: DescriptionNode[];
};

type BulletListNode = {
  Type: "bulletList";
  Content?: ListItemNode[];
};

type OrderedListNode = {
  Type: "orderedList";
  Content?: ListItemNode[];
};

type DescriptionNode =
  | TextNode
  | HeadingNode
  | ParagraphNode
  | ListItemNode
  | BulletListNode
  | OrderedListNode;

type StructuredDescription = {
  Version: number;
  Content: DescriptionNode[];
};

export type JobDescription = string | StructuredDescription;

function isStructuredDescription(
  v: JobDescription,
): v is StructuredDescription {
  return typeof v === "object" && v !== null && "Content" in v;
}

function renderNode(node: DescriptionNode, idx: number): React.ReactNode {
  switch (node.Type) {
    case "heading": {
      const level = node.Attrs?.level ?? 2;
      const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const hClass =
        level === 1
          ? "text-xl font-bold text-foreground mt-6 mb-3"
          : level === 2
            ? "text-base font-bold text-foreground/90 mt-5 mb-2"
            : "text-sm font-bold text-foreground/80 mt-4 mb-2";
      return (
        <HeadingTag key={idx} className={hClass}>
          {node.Content?.map((c, i) => renderNode(c, i))}
        </HeadingTag>
      );
    }
    case "paragraph":
      return (
        <p key={idx} className="text-sm text-muted-foreground leading-relaxed mb-3">
          {node.Content?.map((c, i) => renderNode(c, i))}
        </p>
      );
    case "bulletList":
      return (
        <ul key={idx} className="space-y-1.5 mb-4 ml-1">
          {node.Content?.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
              <span>{item.Content?.map((c, j) => renderNode(c, j))}</span>
            </li>
          ))}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={idx} className="space-y-1.5 mb-4 ml-1 list-none">
          {node.Content?.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary/90 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{item.Content?.map((c, j) => renderNode(c, j))}</span>
            </li>
          ))}
        </ol>
      );
    case "listItem":
      return (
        <span key={idx}>{node.Content?.map((c, i) => renderNode(c, i))}</span>
      );
    case "text": {
      let text: React.ReactNode = node.Text ?? "";
      if (node.Marks) {
        for (const mark of node.Marks) {
          if (mark.Type === "bold")
            text = (
              <strong className="font-semibold text-foreground/90">{text}</strong>
            );
          if (mark.Type === "italic") text = <em>{text}</em>;
          if (mark.Type === "code")
            text = (
              <code className="text-xs bg-muted text-primary/90 px-1.5 py-0.5 rounded font-mono">
                {text}
              </code>
            );
        }
      }
      return <span key={idx}>{text}</span>;
    }
  }
}

const htmlClasses = cn(
  "text-sm text-muted-foreground leading-relaxed",
  "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-5 [&_h1]:mb-2",
  "[&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground/90 [&_h2]:mt-4 [&_h2]:mb-1.5",
  "[&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-foreground/80 [&_h3]:mt-3 [&_h3]:mb-1",
  "[&_p]:mb-2.5 [&_p]:leading-relaxed",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul>li]:mb-1",
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol>li]:mb-1",
  "[&_strong]:font-semibold [&_strong]:text-foreground/90",
  "[&_em]:italic",
  "[&_code]:text-xs [&_code]:bg-muted [&_code]:text-primary/90 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono",
  "[&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:px-3 [&_pre]:py-2 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:my-2 [&_pre]:text-foreground/80",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-2",
  "[&_a]:text-primary [&_a]:underline",
  "[&_hr]:border-gray-200 [&_hr]:my-3",
);

export function DescriptionRenderer({
  description,
}: {
  description: JobDescription;
}) {
  if (typeof description === "string") {
    if (!description) return null;
    return (
      <div
        className={htmlClasses}
        dangerouslySetInnerHTML={{ __html: description }}
      />
    );
  }

  if (!isStructuredDescription(description)) return null;

  return <div>{description.Content.map((node, i) => renderNode(node, i))}</div>;
}
