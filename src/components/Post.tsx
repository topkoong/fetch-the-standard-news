function Post({ post }: any) {
  return (
    <li
      className="relative bg-black border border-4 border-black p-8 grid grid-rows-2 after:absolute after:content-[''] after:-translate-x-3 after:-translate-y-3 after:left-0 after:top-0 after:bg-white after:p-8 after:w-full after:h-full after:-z-2"
      key={
        post?.id || Date.now().toString(16) + Math.random().toString(16) + '0'.repeat(16)
      }
    >
      <header className="z-10">
        <h2 className="font-bold text-base md:text-lg lg:text-xl text-bright-blue">
          {post?.title?.rendered || ''}
        </h2>
      </header>
      <div className="text-center my-8 z-10">
        <button
          className="relative bg-black -z-10 w-40 md:w-48 lg:w-52 p-8 after:absolute after:content-[''] after:-translate-x-2 after:-translate-y-2 after:font-bold after:left-0 after:top-0 after:border after:border-4 after:border-black after:bg-white after:w-40 after:md:w-48 after:lg:w-52 after:h-full after:z-10"
          onClick={() => window.open(post.link)}
        >
          <span className="relative z-20 text-black font-bold w-full h-full -translate-x-2 -translate-y-2 uppercase text-base md:text-lg lg:text-xl">
            Check this out!
          </span>
        </button>
      </div>
    </li>
  );
}

export default Post;
