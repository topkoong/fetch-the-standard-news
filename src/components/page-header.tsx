interface PageHeaderProps {
  readonly title: string;
  /**
   * When false, renders `h2` so another block (e.g. homepage hero) can provide the sole `h1`.
   */
  readonly isPrimaryHeading?: boolean;
}

function PageHeader({ title, isPrimaryHeading = true }: PageHeaderProps) {
  const HeadingTag = isPrimaryHeading ? 'h1' : 'h2';
  return <HeadingTag className='page-title'>{title}</HeadingTag>;
}

export default PageHeader;
