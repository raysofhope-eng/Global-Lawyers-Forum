import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Global Lawyers Forum",
    short_name: "GLF",
    description: "Justice Without Borders",
    start_url: "/",
    display: "standalone",
    background_color: "#0A1723",
    theme_color: "#0A1723",
    icons: [
      { src: "/logo-badge-192.png", sizes: "192x192", type: "image/png" },
      { src: "/logo-badge-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
