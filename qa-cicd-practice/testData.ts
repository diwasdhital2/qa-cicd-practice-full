export const TEST_USERS = {
  valid: {
    username: 'alice',
    password: 'alice123',
  },
  upperCase: {
    username: 'ALICE',
    password: 'alice123',
  },
  invalid: {
    username: 'alice',
    password: 'wrongpassword',
  },
};

export const URLS = {
  home: 'http://localhost:3001/',
};

export const MESSAGES = {
  invalidCredentials: 'Invalid username or password.',
};