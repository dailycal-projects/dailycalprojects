// Names of the article templates an article's `template` frontmatter can choose. Each must have a
// matching component in the `templates` map in src/pages/article/[...slug].astro. The build fails
// if an article names a template that isn't listed here.

export const templateNames = ["default"] as const;

export type TemplateName = (typeof templateNames)[number];
