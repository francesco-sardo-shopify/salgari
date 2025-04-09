import { Link } from "react-router";
import type { Route } from "./+types/library._index";
import { ebooks } from "~/database/schema";
import { desc } from "drizzle-orm";
import { Navigation } from "~/components/Navigation";

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

  return {books};
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { books } = loaderData;
  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
              Your E-Book Library
            </h1>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            <Link
              to="/library/new"
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
            
            {books.map(({id, title}) => (
              <Link
                to={`/library/${id}/read`}
                key={id}
                className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow h-full"
              >
                <div className="relative pt-[140%] w-full">
                  <img
                    src={`/library/${id}.cover`}
                    alt={`Cover of ${title}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
