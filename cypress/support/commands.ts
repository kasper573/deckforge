/// <reference types="cypress" />
import "@testing-library/cypress/add-commands";

Cypress.Commands.overwrite("exec", (originalFn, command, options) => {
  // Workaround to not truncate log
  // https://github.com/cypress-io/cypress/issues/5470#issuecomment-569627930
  return originalFn(command, { ...options, failOnNonZeroExit: false }).then(
    (result) => {
      if (result.code && options && options.failOnNonZeroExit !== false) {
        throw new Error(`Execution of "${command}" failed
      Exit code: ${result.code}
      Stdout:\n${result.stdout}
      Stderr:\n${result.stderr}`);
      }
    }
  );
});
