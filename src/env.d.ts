// Ambient type declarations for globals not covered by lib or workers-types

// process.env is used with a typeof guard for Vercel detection.
// This declaration silences TS2591 without pulling in all of @types/node.
declare const process: { env?: Record<string, string | undefined> } | undefined
