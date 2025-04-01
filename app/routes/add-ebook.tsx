import { Form, useActionData, useNavigate, redirect, useNavigation } from "react-router";
import { v4 as uuidv4 } from "uuid";
import * as schema from "~/database/schema";
import type { InferInsertModel } from "drizzle-orm";
import type { Route } from "./+types/add-ebook";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const authors = formData.get("authors") as string;
  
  if (!title || !title.trim()) {
    return { error: "Title is required" };
  }
  
  if (!authors || !authors.trim()) {
    return { error: "Authors is required" };
  }
  
  const now = new Date().toISOString();
  
  const newEbook: InferInsertModel<typeof schema.ebooks> = {
    id: uuidv4(),
    title: title.trim(),
    authors: authors.trim(),
    createdAt: now,
    updatedAt: now,
    progress: "0"
  };
  
  try {
    await context.db.insert(schema.ebooks).values(newEbook).returning();
    return redirect("/");
  } catch (error) {
    console.error("Error adding ebook:", error);
    return { error: "Failed to add ebook. Please try again." };
  }
}

export function meta() {
  return [
    { title: "Add New E-Book" },
    { name: "description", content: "Add a new e-book to your library" },
  ];
}

export default function AddEbook() {
  const actionData = useActionData<{ error?: string }>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  return (
    <main className="flex flex-col items-center pt-16 pb-4 px-4">
      <div className="flex-1 flex flex-col items-center gap-8 w-full max-w-md">
        <header className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            Add New E-Book
          </h1>
        </header>
        
        <Form 
          method="post"
          className="w-full space-y-6"
        >
          <div className="space-y-2">
            <label 
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter book title"
            />
          </div>
          
          <div className="space-y-2">
            <label 
              htmlFor="authors"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Authors
            </label>
            <input
              type="text"
              id="authors"
              name="authors"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Enter author names"
            />
          </div>
          
          {actionData?.error && (
            <div className="text-red-500 text-sm mt-2">
              {actionData.error}
            </div>
          )}
          
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Adding..." : "Add E-Book"}
            </button>
          </div>
        </Form>
      </div>
    </main>
  );
} 