import { redirect } from "react-router";

export function meta() {
  return [
    { title: "E-Book Library - Welcome" },
    { name: "description", content: "Welcome to your personal E-Book Library" },
  ];
}

export function loader() {
  return redirect("/library");
}
