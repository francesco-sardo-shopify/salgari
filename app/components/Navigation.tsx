import { Link } from "react-router";

interface NavigationProps {
  bookId?: string;
}

export function Navigation({ bookId }: NavigationProps) {
  return (
    <nav className="p-4 bg-gray-100">
      <div className="container mx-auto flex gap-4">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/library" className="hover:underline">
          Library
        </Link>
        {bookId && (
          <>
            <Link to={`/library/${bookId}/read`} className="hover:underline">
              Read
            </Link>
            <Link to={`/library/${bookId}/chat`} className="hover:underline">
              Chat
            </Link>
          </>
        )}
      </div>
    </nav>
  );
} 