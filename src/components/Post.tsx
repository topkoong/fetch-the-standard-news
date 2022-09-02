function Post({ post }: any) {
  return (
    <li
      className='bg-white p-8 shadow-md'
      key={
        post?.id || Date.now().toString(16) + Math.random().toString(16) + '0'.repeat(16)
      }
    >
      <article className='grid grid-rows-3'>
        <header className=''>
          <h2 className='post-title'>{post?.title?.rendered || ''}</h2>
        </header>
        <div className='flex flex-wrap justify-center'>
          <img class='object-contain w-full' src={post?.imageUrl} />
        </div>
        <div className='text-center my-8 '>
          <button className='btn-primary' onClick={() => window.open(post.link)}>
            <span className=' text-black font-bold w-full h-full uppercase text-lg lg:text-xl'>
              Check this out!
            </span>
          </button>
        </div>
      </article>
    </li>
  );
}

export default Post;
