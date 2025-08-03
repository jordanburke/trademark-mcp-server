#!/usr/bin/env node

import server from "./index.js"

// Start the server with stdio transport for MCP clients
server.start({
  transportType: "stdio",
})

process.on("SIGINT", () => {
  console.error("Received SIGINT, shutting down gracefully...")
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.error("Received SIGTERM, shutting down gracefully...")
  process.exit(0)
})
