/**
 * Keyword-Rich Content Component
 * Helps with SEO by providing semantic structure for keyword-rich content
 */

interface KeywordRichContentProps {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
}

export function KeywordRichContent({
  children,
  className,
  as = "section",
}: KeywordRichContentProps) {
  const Component = as;

  return <Component className={className}>{children}</Component>;
}

/**
 * FAQ Component for FAQ Schema
 */
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  className?: string;
}

export function FAQ({ items, className }: FAQProps) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <dl className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="border-b border-border pb-4">
            <dt className="font-semibold text-lg mb-2">{item.question}</dt>
            <dd className="text-muted-foreground">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
