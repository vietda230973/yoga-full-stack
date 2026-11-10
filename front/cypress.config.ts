import { defineConfig } from 'cypress'
import registerCodeCoverageTasks from '@cypress/code-coverage/task'

export default defineConfig({
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  video: false,
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    charts: true
  },
  e2e: {
     setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config)
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config
    },
    baseUrl: 'http://localhost:4200',
  },
})
