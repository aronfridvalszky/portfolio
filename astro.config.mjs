// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE_URL } from "./src/consts.ts";
import { isNoindexRoute } from "./src/utils/seo.ts";

export default defineConfig({
  site: SITE_URL,
  integrations: [
    sitemap({
      filter: (page) => !isNoindexRoute(new URL(page).pathname),
    }),
  ],
  fonts: [
    {
      name: "Neue Montreal",
      cssVariable: "--font-neue-montreal",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 300,
            style: "normal",
            src: ["./src/assets/fonts/neue-montreal-light.woff2"],
          },
          {
            weight: 300,
            style: "italic",
            src: ["./src/assets/fonts/neue-montreal-light-italic.woff2"],
          },
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/neue-montreal-regular.woff2"],
          },
          {
            weight: 400,
            style: "italic",
            src: ["./src/assets/fonts/neue-montreal-italic.woff2"],
          },
          {
            weight: 500,
            style: "normal",
            src: ["./src/assets/fonts/neue-montreal-medium.woff2"],
          },
          {
            weight: 500,
            style: "italic",
            src: ["./src/assets/fonts/neue-montreal-medium-italic.woff2"],
          },
          {
            weight: 700,
            style: "normal",
            src: ["./src/assets/fonts/neue-montreal-bold.woff2"],
          },
          {
            weight: 700,
            style: "italic",
            src: ["./src/assets/fonts/neue-montreal-bold-italic.woff2"],
          },
        ],
      },
    },
  ],
  vite: { build: { cssTarget: "safari15.4" } },
});
