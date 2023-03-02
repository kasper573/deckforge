module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  passWithNoTests: true,
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc-node/jest",
      {
        swc: {
          sourceMaps: "inline",
        },
      },
    ],
  },
};
