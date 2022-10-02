# Boilerplate Remix

## Typescript + React + Remix + Prisma

Comes with user authentication included

- [React](https://github.com/facebook/react)
- [Prisma](https://www.prisma.io)
- [Remix](https://github.com/remix-run/remix)
- [TypeScript](https://github.com/microsoft/TypeScript)
- [Postgres](https://github.com/postgres/postgres)
- [Chakra UI](https://github.com/chakra-ui/chakra-ui)
- [Eslint](https://github.com/eslint/eslint)
- [Prettier](https://github.com/prettier/prettier)
- [Husky](https://github.com/typicode/husky)
- [Lint staged](https://github.com/okonet/lint-staged)
- Sendgrid SMTP
- Customizable theme & Dark mode

& many more tasty treats

## Get Started

**Must have node, yarn, postgres and redis installed and setup locally**

1. `yarn install`
2. `createdb boilerplate`
3. `yarn db:migrate`

Make sure you have created a .env file in the api package with the right values, you can use .env.example as the template

We use Husky to run a couple of checks each commit (prettier, eslint & commitlint), make sure to add a
.huskyrc file to your home directory ~/.huskyrc, and add this in:

```bash
export PATH="/usr/local/bin:$PATH"
```

then run

```bash
npx husky install
```

## Development

`yarn dev`

## Production

### Mailers

- Create a Sendgrid account and set a SENDGRID_API_KEY environment variable in .env
- Create templates for each email you want to send and use the templateId in the corresponding mailer class

### Deployment

An example is deployed [here](https://boilerplate-remix.noquarter.co)

We are using Fly.io

### Extra info

- [Remix Docs](https://remix.run/docs)
