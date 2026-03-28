import type { ComponentChildren } from 'preact';

export interface EmptyStatePanelProps {
  readonly title: string;
  readonly description: string;
  /** Default: status. Use alert for load/sync failures. */
  readonly role?: 'alert' | 'status';
  /** `emphasis` matches the home “sync error” panel (stronger shadow). */
  readonly variant?: 'default' | 'emphasis';
  /** Use h3 when nested under a list or section with an existing page heading. */
  readonly headingLevel?: 'h2' | 'h3';
  readonly children?: ComponentChildren;
}

/**
 * plan.md PR 17 — shared empty / error surface with recovery actions.
 */
export function EmptyStatePanel({
  title,
  description,
  role = 'status',
  variant = 'default',
  headingLevel = 'h2',
  children,
}: EmptyStatePanelProps) {
  const rootClass =
    variant === 'emphasis'
      ? 'mx-6 my-8 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-5 text-center text-white shadow-md'
      : 'mx-3 sm:mx-6 my-10 rounded-xl border-2 border-white/30 bg-white/10 p-6 text-center text-white';
  const HeadingTag = headingLevel;
  return (
    <section className={rootClass} role={role}>
      <HeadingTag className='text-xl font-extrabold uppercase tracking-wide'>
        {title}
      </HeadingTag>
      <p className='mt-2 text-white/90'>{description}</p>
      {children ? (
        <div className='mt-4 flex justify-center gap-3 flex-wrap'>{children}</div>
      ) : null}
    </section>
  );
}
