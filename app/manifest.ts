import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tugether",
    short_name: "Tugether",
    description: "Nabung bareng sampai tercapai. Cukup login email, tanpa wallet.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#f4b740",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
