interface PageHeaderProps {
  title: string;
}

function PageHeader({ title }: PageHeaderProps) {
  return (
    <article className="bg-bright-blue w-full">
      <h1 className="text-center font-extrabold leading-tight text-5xl py-8 text-white uppercase">
        {title}
      </h1>
    </article>
  );
}

export default PageHeader;
