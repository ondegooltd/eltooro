/**
 * Semantic Heading Component
 * Ensures proper heading hierarchy for SEO
 */

import React from "react";

interface SemanticHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SemanticHeading({
  level,
  children,
  className,
  id,
}: SemanticHeadingProps) {
  const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  return React.createElement(HeadingTag, { className, id }, children);
}
