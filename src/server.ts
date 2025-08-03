import server from "./index.js"

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080

server.start({
  transportType: "httpStream",
  httpStream: {
    port,
  },
})

console.log(`🚀 Trademark MCP Server running on http://localhost:${port}`)
console.log(`📋 Health check: http://localhost:${port}/health`)
console.log(`🔍 MCP endpoint: http://localhost:${port}/mcp`)
