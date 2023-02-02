# Deck Forge

[deckforge.io](https://deckforge.io) is a service for creating and sharing deck builder games.

## Stack

- UI: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/) + [MUI](https://mui.com/), hosted on [Vercel](https://vercel.com/)
- API: [tRPC](https://trpc.io/) + [Express](https://expressjs.com/), hosted on [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- DB: [Prisma](https://www.prisma.io/) (mysql) + [PlanetScale](https://planetscale.com) (via [auto migrations](https://planetscale.com/docs/tutorials/automatic-prisma-migrations))
- Tests: [Jest](https://jestjs.io/) (unit) / [Cypress](https://www.cypress.io/) (component/e2e) + [Testing Library](https://testing-library.com/)

## Getting started

Before you can start developing there are a few things you need to do:

Create a `.env.local` file in the root of the project and add the following:

```bash
DATABASE_URL=<connection string to your development mysql database>
```

Run `yarn db:push` to update your development database
Run `yarn db:seed` to seed your database

## Usage

- `yarn dev` To start the local development server
- `yarn test:unit` to run unit tests
- `cypress open|run` to develop or run e2e tests (needs the local dev server running)
- `yarn lint|lint:fix` to display or fix linting errors

## Contributing

Contributions are welcome! Please open an issue or PR to discuss any changes.
PRs will only be merged once they are well tested and pass all checks.
