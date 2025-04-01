import { EbookLibrary } from "../welcome/welcome";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "E-Book Library" },
    { name: "description", content: "Your personal E-Book Library" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const ebooks = await context.db.query.ebooks.findMany();

  return {
    ebooks,
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <EbookLibrary
      ebooks={loaderData.ebooks}
      message={loaderData.message}
    />
  );
}
