import slugify from "slugify";

export const gameSlug = (gameName: string) =>
  slugify(gameName, { lower: true });
