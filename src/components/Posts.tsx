import PageHeader from './PageHeader';
import axios from 'axios';

interface PostsProps {
  id: number;
}

export function Posts({ id }: PostsProps) {
  return (
    <article className="bg-bright-blue w-full">
      <h1 className="text-center font-extrabold leading-tight text-5xl py-8 text-white uppercase">
        Fetch The Standard News - Catrgory ID: {{ id }}
      </h1>
      <PageHeader title={`Fetch The Standard News - Catrgory ID: ${id}`} />
    </article>
  );
}
