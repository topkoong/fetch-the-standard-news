/**
 * Shared layout for “nothing to show” and recoverable error states (plan.md PR 17).
 *
 * When to use
 * -----------
 * - **Empty data**: valid route, bundle loaded, but no rows (e.g. quiet category desk).
 * - **Failed load**: network or query failure where retry / navigation is the right CTA.
 *
 * Accessibility
 * ---------------
 * - Pass `role="alert"` for **errors** so assistive tech announces the failure prominently.
 * - Default `role="status"` is appropriate for non-critical empty states (less intrusive).
 * - Pick `headingLevel="h3"` when this block sits under an existing page `<h1>`/`<h2>` so
 *   the heading outline stays logical (e.g. empty state inside a list on the home feed).
 *
 * Styling
 * -------
 * `variant="emphasis"` preserves the stronger home-page sync-error treatment (tighter
 * margins + shadow). `default` is tuned for in-flow empty states on list pages.
 */

import type { ComponentChildren } from 'preact';

export interface EmptyStatePanelProps {
  /** Short, scannable headline (often uppercase in design). */
  readonly title: string;
  /** One or two sentences explaining what happened and what the user can do next. */
  readonly description: string;
  /**
   * WAI-ARIA role on the wrapping `<section>`.
   * - `alert`: sync/load failures (home error, posts desk error).
   * - `status`: informational empty state (no stories yet).
   */
  readonly role?: 'alert' | 'status';
  /**
   * Visual weight; does not change semantics.
   * `emphasis` matches the legacy home “Something went wrong” panel.
   */
  readonly variant?: 'default' | 'emphasis';
  /**
   * Heading element for `title`. Use `h3` when this panel is nested under a section that
   * already exposes an `h2` (e.g. home feed list).
   */
  readonly headingLevel?: 'h2' | 'h3';
  /** Optional actions: buttons, `Link`s, etc. Rendered in a centered flex row with gap. */
  readonly children?: ComponentChildren;
}

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
  /* Dynamic heading tag keeps one component while satisfying document outline rules. */
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
