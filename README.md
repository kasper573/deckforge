# Deck Forge

[deckforge.io](https://deckforge.io) is a service that lets users easily create their own deck builder games. The games can be played directly in the browser and can be shared with friends.

> Deck Forge is currently in development. The site is open but not stable and will undergo heavy changes and database resets. Use at your own risk.

## Stack

- UI: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/) + [MUI](https://mui.com/), hosted on [Vercel](https://vercel.com/)
- API: [tRPC](https://trpc.io/) + [Express](https://expressjs.com/), hosted on [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- DB: [Prisma](https://www.prisma.io/) (mysql) + [PlanetScale](https://planetscale.com) (via [auto migrations](https://planetscale.com/docs/tutorials/automatic-prisma-migrations))
- Auth: [Auth0](https://auth0.com/)
- Tests: [Jest](https://jestjs.io/) / [Cypress](https://www.cypress.io/) + [react-testing-library](https://testing-library.com/)

## Getting started

Before you get started, create a `.env.local` file in the root of the project and add the following:

```bash
DATABASE_URL=<connection string to your development mysql database>
VITE_AUTH_IMPLEMENTATION=fake # Only necessary for auth related e2e tests to work
```

## Usage

- `yarn dev` To start the local development server
- `yarn test:unit` (`-- watch`) to run unit tests
- `cypress open|run` to develop or run e2e tests (needs the local dev server running)
- `yarn lint|lint:fix` to display or fix linting errors

## Contributing

Contributions are welcome! Please open an issue or PR to discuss any changes. Make sure your contributions are accompanied by e2e and/or unit tests. PRs will only be merged are well tested and pass all checks.
