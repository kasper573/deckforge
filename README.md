# Deck Forge

[deckforge.io](https://deckforge.io) is a service that lets users easily create their own deck builder games. The games can be played directly in the browser and can be shared with friends.

> Deck Forge is currently in development. The site is open but not stable and will undergo heavy changes and database resets. Use at your own risk.

## Stack

- UI: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/) + [MUI](https://mui.com/)
- API: [tRPC](https://trpc.io/) via [Express](https://expressjs.com/) + [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- DB: [Prisma](https://www.prisma.io/) (mysql) + [PlanetScale & auto migrations](https://planetscale.com/docs/tutorials/automatic-prisma-migrations)
- Auth: [Auth0](https://auth0.com/)
- Tests: [Jest](https://jestjs.io/) / [Cypress](https://www.cypress.io/) + [react-testing-library](https://testing-library.com/)

## Usage

Before you get started

- `yarn dev` To start the local development server
- `yarn test:unit` (`-- watch`) to run unit tests
- `cypress open|run` to develop or run e2e tests (needs the local dev server running)
- `yarn lint|lint:fix` to display or fix linting errors

## Deployment

Branches are automatically deployed by vercel. The main branch is deployed to [deckforge.io](https://deckforge.io) and all other branches are given a temporary subdomain at vercel. The vercel bot will comment on the PR with the temporary subdomain.

## Contributing

Contributions are welcome! Please open an issue or PR to discuss any changes. Make sure your contributions are accompanied by e2e and/or unit tests. PRs will only be merged are well tested and pass all checks.
