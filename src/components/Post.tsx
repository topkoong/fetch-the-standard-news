function Post({ post }: any) {
  return (
    <li
      className="relative bg-black border border-4 border-black p-8 grid grid-rows-2 after:absolute after:content-[''] after:-translate-x-3 after:-translate-y-3 after:left-0 after:top-0 after:bg-white after:p-8 after:w-full after:h-full after:-z-2"
      key={
        post?.id || Date.now().toString(16) + Math.random().toString(16) + '0'.repeat(16)
      }
    >
      <header className="z-10">
        <h2 className="post-title">{post?.title?.rendered || ''}</h2>
      </header>
      <div className="text-center my-8 z-10">
        <button className="btn-primary" onClick={() => window.open(post.link)}>
          <span className="relative z-20 text-black font-bold w-full h-full -translate-x-2 -translate-y-2 uppercase text-lg lg:text-xl">
            Check this out!
          </span>
        </button>
      </div>
    </li>
  );
}

export default Post;
