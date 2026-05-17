import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: false,
  viewportHeight: 900,
  viewportWidth: 1440,
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:3001",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
  },
});
