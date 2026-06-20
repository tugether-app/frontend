import { redirect } from "next/navigation";

// Goals now live on the home dashboard. Keep this path working for old links.
export default function GoalsRedirect() {
  redirect("/");
}
