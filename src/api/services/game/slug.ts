import slugify from "slugify";

export const gameSlug = (ownerName: string, gameName: string) =>
  slugify(`${ownerName}-${gameName}`, { lower: true });
