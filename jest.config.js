module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  passWithNoTests: true,
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc-node/jest"],
  },
};
