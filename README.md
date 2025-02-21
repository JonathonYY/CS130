## Getting Started

If you don't have Node JS or npm installed, go to http://nodejs.org/ and download the LTS version.
If you don't have git installed, ...

Clone repo:

```bash
git clone https://github.com/JonathonYY/CS130.git bmart
```

Change into project directory

```bash
cd bmart
```

Install project dependencies

```bash
npm i
```

Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Any changes you make and save will automatically update the webpage through a feature called [Fast Refresh](https://nextjs.org/docs/architecture/fast-refresh)

API route testing can be done with [Postman](https://www.postman.com)

## .env.local

Make sure you have a .env.local file within the root directory
It contains private configuration variables that can't be pushed onto GitHub,
so you'll have to create it in order to run the project locally.
It should be on the Notion in "The Backend" section.

## Testing
We utilize [jest](https://jestjs.io/docs/getting-started) for mocking and [ts-jest](https://kulshekhar.github.io/ts-jest/docs/getting-started/installation) to support typescript with jest.
