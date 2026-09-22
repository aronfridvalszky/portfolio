import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/projects" }),
  schema: z.object({
    /** Where it sits in the Work list. Lower shows first. */
    order: z.number(),
    heading: z.string(),
    client: z.string().optional(),
    period: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /** Colors the card's image panel. Shows through until `cardImage` is set. */
    tint: z.enum(["teal", "purple"]).default("teal"),
    /** A path in `public/` for the card's image panel. Left unset, `tint` shows instead. */
    cardImage: z.string().optional(),
    /**
     * - `default` — a finished case study
     * - `in-progress` — shows the status badge instead of tags-only framing
     */
    status: z.enum(["default", "in-progress"]).default("default"),
    /** Where the card leads. Left unset, it renders as a plain, unlinked card. */
    href: z.string().optional(),
    /** The live site, shown as a "See live project" link on the project's own page. Left unset, nothing is shown. */
    liveUrl: z.string().optional(),
    /** The case-study sections shown on the project's own page. */
    blocks: z
      .array(
        z.object({
          label: z.string(),
          paragraphs: z.array(z.string()),
          /**
           * Paths in `public/` for the block's media, shown full-width, one
           * below another. A video path (`.mp4`/`.webm`/`.mov`) plays as a
           * looping, muted video. A `[path, path]` pair renders side by side
           * on desktop and stacks on mobile, instead of full-width.
           */
          images: z
            .array(z.union([z.string(), z.tuple([z.string(), z.string()])]))
            .default([]),
        }),
      )
      .default([]),
  }),
});

export const collections = { projects };
