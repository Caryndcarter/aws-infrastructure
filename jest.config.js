// eslint-disable-next-line no-undef
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.(spec|test).ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
