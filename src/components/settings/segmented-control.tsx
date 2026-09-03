"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  "aria-label": string;
}

export function SegmentedControl({ value, onChange, options, ...props }: SegmentedControlProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onChange}>
      <TabsPrimitive.List className="inline-flex gap-1 rounded-md bg-secondary p-1" {...props}>
        {options.map((option) => (
          <TabsPrimitive.Trigger
            key={option.value}
            value={option.value}
            className="rounded-md px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-accent-500 data-[state=active]:text-white"
          >
            {option.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}
