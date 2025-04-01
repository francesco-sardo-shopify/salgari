import { Link } from "react-router";
import type { Route } from "./+types/home";
import { ebooks } from "~/database/schema";
import { desc } from "drizzle-orm";

export function meta() {
  return [
    { title: "E-Book Library" },
    { name: "description", content: "Your personal E-Book Library" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const { db } = context;
  const books = await db.query.ebooks.findMany({
    orderBy: [desc(ebooks.createdAt)],
  });

  return {
    books,
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { books, message } = loaderData;
  return (
    <main className="flex flex-col items-center pt-16 pb-4 px-4">
      <div className="flex-1 flex flex-col items-center gap-8 w-full max-w-6xl">
        <header className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            Your E-Book Library
          </h1>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          <Link
            to="/upload"
            className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow h-full"
          >
            <div className="relative pt-[140%] w-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-400 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-center text-gray-600 dark:text-gray-300 font-medium">
                  Upload a new book
                </span>
              </div>
            </div>
          </Link>
          
          {books.map((book) => (
            <Link
              to={`/reader/${book.id}`}
              key={book.id}
              className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow h-full"
            >
              <div className="relative pt-[140%] w-full">
                <img
                  src={`/asset/${book.id}.cover`}
                  alt={`Cover of ${book.title}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-sm text-gray-500 mt-8">{message}</div>
      </div>
    </main>
  );
}
