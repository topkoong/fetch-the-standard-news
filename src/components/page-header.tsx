interface PageHeaderProps {
  readonly title: string;
  /**
   * When false, renders `h2` so another block (e.g. homepage hero) can provide the sole `h1`.
   */
  readonly isPrimaryHeading?: boolean;
  /** Use on `bg-gray-50` layouts; default keeps white type for blue/dark shells. */
  readonly tone?: 'dark' | 'light';
}

function PageHeader({ title, isPrimaryHeading = true, tone = 'dark' }: PageHeaderProps) {
  const HeadingTag = isPrimaryHeading ? 'h1' : 'h2';
  const titleClass = tone === 'light' ? 'page-title-light' : 'page-title';
  return <HeadingTag className={titleClass}>{title}</HeadingTag>;
}

export default PageHeader;
