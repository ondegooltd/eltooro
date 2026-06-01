// Minimal env so Mongoose / Mongo helpers can load in unit tests (no real DB required for pure mocks).
process.env.MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/toroglo-jest";
process.env.NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  "test-secret-test-secret-test-secret-test-32";
