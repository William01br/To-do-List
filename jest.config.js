// "jest": {
//     "testEnvironment": "node",
//     "setupFiles": [
//       "./tests/setupFiles.js"
//     ],
//     "setupFilesAfterEnv": [
//       "./tests/setupAfterEnv.js"
//     ],
//     "globalSetup": "./tests/globalSetup.js",
//     "coverageDirectory": "coverage",
//     "collectCoverage": true,
//     "testMatch": [
//       "**/tests/**/*.test.js"
//     ],
//     "verbose": true,
//     "transform": {
//       "^.+\\.jsx?$": "babel-jest"
//     }
//   },
import path from "node:path";
import { fileURLToPath } from "node:url";

const _dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(_dirname);

const unitConfig = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  testEnvironment: "node",
  clearMocks: true,
  displayName: "unit",
  rootDir: root,
  testMatch: ["<rootDir>/test/unit/**/*.spec.js"],
  collectCoverageFrom: ["<rootDir>/test/unit/**/*.spec.js"],
  coverageDirectory: "<rootDir>/coverage/unit",
};

const e2eConfig = {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  testEnvironment: "node",
  clearMocks: true,
  displayName: "e2e",
  rootDir: root,
  testMatch: ["<rootDir>/test/e2e/**/*.spec-e2e.js"],
  globalSetup: "<rootDir>/test/setup/jest.global-setup.js",
  setupFilesAfterEnv: ["<rootDir>/test/setup/jest.setup-e2e.js"],
  collectCoverageFrom: ["<rootDir>/test/e2e/**/*.spec-e2e.js"],
  coverageDirectory: "<rootDir>/coverage/e2e",
};

const config = {
  projects: [unitConfig, e2eConfig],
};

export default config;
