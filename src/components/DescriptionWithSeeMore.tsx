"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_TRUNCATE_LENGTH = 200;

interface DescriptionWithSeeMoreProps {
  description: string;
  className?: string;
  textClassName?: string;
  truncateLength?: number;
  expandLabel?: string;
  collapseLabel?: string;
}

export function DescriptionWithSeeMore({
  description,
  className,
  textClassName,
  truncateLength = DEFAULT_TRUNCATE_LENGTH,
  expandLabel = "See more",
  collapseLabel = "See less",
}: DescriptionWithSeeMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = description.length > truncateLength;
  const displayText = shouldTruncate && !expanded
    ? `${description.slice(0, truncateLength).trim()}${description.length > truncateLength ? "…" : ""}`
    : description;

  return (
    <div className={cn("space-y-2", className)}>
      <p className={cn("whitespace-pre-wrap", textClassName)}>
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
        >
          {expanded ? (
            <>
              {collapseLabel}
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              {expandLabel}
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
