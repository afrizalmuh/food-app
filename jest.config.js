module.exports = {
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "~/(.*)": "<rootDir>/src/$1",
  },
};
