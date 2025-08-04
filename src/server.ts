import { createServer } from "http"
import server from "./index.js"

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

// Create HTTP server for health checks and MCP endpoints
const httpServer = createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      service: "trademark-mcp-server"
    }))
    return
  }

  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
      name: "trademark-mcp-server",
      version: "1.0.0",
      description: "USPTO Trademark MCP Server",
      endpoints: {
        health: "/health",
        mcp: "/mcp"
      }
    }))
    return
  }

  // For all other routes, pass to FastMCP
  res.writeHead(404, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "Not found" }))
})

// Start the HTTP server
httpServer.listen(port, () => {
  console.log(`🚀 Trademark MCP Server running on http://localhost:${port}`)
  console.log(`📋 Health check: http://localhost:${port}/health`)
  console.log(`🔍 MCP endpoint: http://localhost:${port}/mcp`)
})

// Start FastMCP server with HTTP transport
server.start({
  transportType: "httpStream",
  httpStream: {
    port: port + 1, // Use next port for MCP
  },
})
