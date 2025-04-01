import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("upload", "routes/upload.tsx"),  
  route("reader/:id", "routes/reader.tsx"),
  route("asset/:id", "routes/asset.ts"),
] satisfies RouteConfig;
