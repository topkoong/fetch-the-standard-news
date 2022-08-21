interface PageHeaderProps {
  title: string;
}

function PageHeader({ title }: PageHeaderProps) {
  return <h1 className="page-title">{title}</h1>;
}

export default PageHeader;
