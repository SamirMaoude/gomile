// Runs after the Jest test framework (jest-circus) is installed, so beforeEach
// and other lifecycle functions are available here. Resets shared mutable state
// and re-initialises global.fetch before every individual test case to prevent
// cross-test contamination from mock call history or cached responses.

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
});
