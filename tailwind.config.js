// Re-export the canonical Tailwind config from `src/tailwind.config.js`.
// This keeps the single source of truth inside `src/` while allowing
// Next and Tailwind to resolve the config at the project root.
module.exports = require('./src/tailwind.config.js');