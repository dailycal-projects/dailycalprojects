// Site-wide constants: names, descriptions and contact links used by the layout, SEO tags and
// article footers. Change them here rather than in individual pages.

export const site = {
  /** Used in <title>s, og:site_name and as the JSON-LD publisher. */
  name: "The Daily Californian: Data",
  /** Appended to article titles: "<headline> | The Daily Californian". */
  articleTitleSuffix: "The Daily Californian",
  /** Default meta description, and the tagline on the homepage. */
  description:
    "Investigative stories, data analysis and graphics by The Daily Californian's Data Team.",
  contactEmail: "projects@dailycal.org",
  githubUrl: "https://github.com/dailycal-projects/dailycalprojects",
  donateUrl: "https://givebutter.com/w68cQv",
  mainSiteUrl: "https://www.dailycal.org",
  contactUrl: "https://www.dailycal.org/site/contact-us.html",
  /** Where an author's byline links when the article doesn't set a bylineLinks entry for them. */
  authorProfileUrl: (author: string) =>
    `https://www.dailycal.org/users/profile/${encodeURIComponent(author)}/`,
};
