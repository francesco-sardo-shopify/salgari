import { Link } from "react-router";
import type { Route } from "./+types/home";
import { ebooks } from "~/database/schema";
import { desc } from "drizzle-orm";
import { Navigation } from "~/components/Navigation";

export function meta() {
  return [
    { title: "E-Book Library - Welcome" },
    { name: "description", content: "Welcome to your personal E-Book Library" },
  ];
}

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <Navigation />
      <div className="flex flex-col items-center min-h-screen p-6">
        <h1 className="text-5xl font-bold mb-6 text-blue-600 dark:text-blue-400">
          Welcome to Your E-Book Library
        </h1>
        
        <div className="mb-10 space-y-6">
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Your personal digital bookshelf for managing and enjoying your favorite ebooks.
          </p>
          
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Store, organize, and read your collection from anywhere, on any device.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/library"
            className="inline-block px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Explore Your Library
          </Link>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Access your complete collection of ebooks, upload new ones, and start reading right away.
          </p>
        </div>
      </div>
    </main>
  );
}
