const path = require("path")

const linkedLibrary = path.resolve(__dirname, "..", "build")

const project = (displayName, preset) => ({
  displayName,
  preset,
  testMatch: ["<rootDir>/headless/**/*.test.tsx"],
  transformIgnorePatterns: [...require(`${preset}/jest-preset`).transformIgnorePatterns, linkedLibrary],
})

module.exports = {
  projects: [project("ios", "jest-expo/ios"), project("android", "jest-expo/android")],
}
