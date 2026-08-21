// Minimal ambient declaration for server-only env var access via process.env.
// Deliberately not pulling the full @types/node lib into tsconfig's "types"
// array — that would add Node's ambient globals (Buffer, NodeJS.Timeout,
// etc.) everywhere, including browser code, and those can conflict with the
// DOM lib types this app is built against (e.g. setTimeout's return type).
declare const process: {
  env: Record<string, string | undefined>;
};
