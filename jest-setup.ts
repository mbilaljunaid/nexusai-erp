// Jest setup file - declare globals for test environment
declare global {
  var describe: jest.Describe;
  var it: jest.It;
  var expect: jest.Expect;
  var beforeEach: jest.HookFn;
  var afterEach: jest.HookFn;
}
