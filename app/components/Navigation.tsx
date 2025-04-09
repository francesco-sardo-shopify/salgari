import { Link, useLocation } from "react-router";

export function Navigation() {
  const location = useLocation();
  const isReadPage = location.pathname.endsWith("/read");
  const isChatPage = location.pathname.endsWith("/chat");

  return (
    <nav className="bg-gray-100 dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex gap-4 items-center">
        <Link to="/library" className="font-medium text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
          Home
        </Link>
        {isChatPage && (
          <Link to={`../read`} relative="path" className="font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Switch to Read
          </Link>
        )}
        {isReadPage && (
          <Link to={`../chat`} relative="path" className="font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            Switch to Chat
          </Link>
        )}
      </div>
    </nav>
  );
}
