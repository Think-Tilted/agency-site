export interface Project {
  slug: string;
  name: string;
  type: string;
  year: string;
  summary: string;
}

export const projects: Project[] = [
  {
    slug: "blackbird-supper-club",
    name: "Blackbird Supper Club",
    type: "Restaurant / Venue",
    year: "2026",
    summary:
      "A bold, editorial brand site for a restaurant and event venue, with custom typography and layered imagery.",
  },
  {
    slug: "placeholder-project",
    name: "Placeholder Project",
    type: "Coming soon",
    year: "—",
    summary: "A future project. Details to come as the studio grows.",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
