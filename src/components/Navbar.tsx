import { Link } from 'react-router-dom';

function NavBar() {
  const categories: { [key: string]: string } = {
    '39': 'News',
    '11': 'World',
    '12': 'Thailand',
    '13': 'Business',
    '14': 'Sport',
    '26': 'Film',
    '27': 'Music',
    '33': 'Travel',
    '58822': 'Economic',
  };
  return (
    <nav className="flex items-center justify-between flex-wrap bg-white py-4 lg:px-12 shadow border-solid border-t-2 border-blue-700">
      <div className="flex justify-between lg:w-auto w-full lg:border-b-0 pl-6 pr-2 border-solid border-b-2 border-gray-300 pb-5 lg:pb-0">
        <div className="flex items-center flex-shrink-0 text-gray-800 mr-16">
          <Link to="/" className="font-semibold text-3xl tracking-tight uppercase">
            Top News
          </Link>
        </div>
        <div className="block lg:hidden">
          <button
            id="nav"
            className="flex items-center px-3 py-2 border-2 rounded text-blue-700 border-blue-700 hover:text-blue-700 hover:border-blue-700"
          >
            <svg
              className="fill-current h-3 w-3"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="menu w-full lg:block flex-grow lg:flex lg:items-center lg:w-auto lg:px-3 px-8">
        <div className="text-md font-bold text-blue-700 lg:flex-grow">
          {Object.keys(categories).map((key: string) => (
            <Link
              key={`${categories[key]}`}
              to={`/posts/categories/${key}`}
              state={{ category: categories[key] }}
              className="uppercase block mt-4 lg:inline-block lg:mt-0 hover:text-white px-2 py-2 rounded hover:bg-blue-700 mr-2"
            >
              {categories[key]}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
