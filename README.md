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

## .env

Make sure you have a .env file within the root directory
It contains private configuration variables that can't be pushed onto GitHub,
so you'll have to create it in order to run the project locally.
It should look something like:

```
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="..."
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST="..."
GOOGLE_APPLICATION_CREDENTIALS="..."
```

## Token Configuration

"For secure token authentication, ensure your Firebase Admin SDK credentials are correctly configured. Store the `firebase-admin-sdk.json` file in your project's root and add `GOOGLE_APPLICATION_CREDENTIALS="./firebase-admin-sdk.json"` to your `.env` file. The `.gitignore` should already be configured to prevent pushing both of these files to version control. The file can be found on the Discord.

## Testing

We utilize [jest](https://jestjs.io/docs/getting-started) for mocking and [ts-jest](https://kulshekhar.github.io/ts-jest/docs/getting-started/installation) to support typescript with jest.

Test files are named in the format of <src>.test.ts, and are co-located with the file they are testing. This means that, for example, each API route, route.ts, should have a route.test.ts file in the same directory.

All `jest` tests are collected and run together with `npm test`.

Additionally, integration tests are executed with the help of Firebase Emulator, which supports operations to a production-like Firebase database. The setup is done automatically with the `npm test` script. Alternatively, to run manual integration tests, run `firebase emulators:start` first to spin up the service.

## Directory Structure

- `src/app/`: Contains the Next.js application source code (pages use file-based routing)
  - `/page.tsx`: The main page of the application.
  - `/components/`: Reusable React components.
  - `/lib/`: Utility functions, Firebase initialization functions, and Auth Context initialization.
  - `/api/`: Next.js API routes for backend functionality (which uses file-based routing)
  - `globals.css`: Global CSS styles.
- `public/`: Static assets (images)
- `.gitignore`: Specifies files to ignore in Git version control.
