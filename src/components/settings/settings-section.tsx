import type { ReactNode } from "react";

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{title}</h2>
      <div className="mt-2 border-b" />
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export function SettingsRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="text-sm text-foreground sm:w-40 sm:shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
