/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
<<<<<<< HEAD
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["dotenv/config"]
};
=======
    testEnvironment: "node",
    transform: {
      "^.+.tsx?$": ["ts-jest",{}],
    },
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1",
    }
};
>>>>>>> b85a1bf (begin unit tests, fix API problems)
