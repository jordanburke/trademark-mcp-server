import server from "./index.js"

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

// Start FastMCP server with HTTP transport
// FastMCP automatically provides:
// - /mcp endpoint for MCP protocol
// - /health endpoint (configured in index.ts)
server.start({
  transportType: "httpStream",
  httpStream: {
    port: port,
  },
})

console.log(`🚀 Trademark MCP Server running on http://localhost:${port}`)
console.log(`📋 Health check: http://localhost:${port}/health`)
console.log(`🔍 MCP endpoint: http://localhost:${port}/mcp`)
