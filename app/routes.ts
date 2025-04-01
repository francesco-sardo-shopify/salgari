import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("add-ebook", "routes/add-ebook.tsx")
] satisfies RouteConfig;
