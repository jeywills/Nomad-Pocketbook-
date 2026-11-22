import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nomad Pocketbook",
    short_name: "Pocketbook",
    description: "Weather, time zones and budgets for people who move around.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#0f766e",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
