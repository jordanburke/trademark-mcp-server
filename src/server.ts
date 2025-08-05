import { createServer } from "http"
import { URL } from "url"
import server from "./index.js"

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000

// Create HTTP server for health checks and MCP endpoints
const httpServer = createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  const url = new URL(req.url || "", `http://localhost:${port}`)

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(
      JSON.stringify({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        service: "trademark-mcp-server",
      }),
    )
    return
  }

  if (url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(
      JSON.stringify({
        name: "trademark-mcp-server",
        version: "1.0.0",
        description: "USPTO Trademark MCP Server",
        endpoints: {
          health: "/health",
          mcp: "/mcp",
        },
      }),
    )
    return
  }

  if (url.pathname === "/mcp") {
    // Proxy MCP requests to the FastMCP server
    try {
      const mcpResponse = await fetch(`http://localhost:${port + 1}${url.pathname}${url.search}`, {
        method: req.method,
        headers: Object.fromEntries(
          Object.entries(req.headers)
            .filter(([key]) => !['host', 'connection'].includes(key.toLowerCase()))
            .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value || ''])
        ),
        body: req.method !== 'GET' && req.method !== 'HEAD' ? await getRequestBody(req) : undefined,
      })

      // Copy response headers
      mcpResponse.headers.forEach((value, key) => {
        res.setHeader(key, value)
      })

      res.writeHead(mcpResponse.status)
      
      // Stream the response
      if (mcpResponse.body) {
        const reader = mcpResponse.body.getReader()
        const pump = async () => {
          const { done, value } = await reader.read()
          if (done) {
            res.end()
            return
          }
          res.write(Buffer.from(value))
          return pump()
        }
        await pump()
      } else {
        res.end()
      }
    } catch (error) {
      console.error("Error proxying to MCP server:", error)
      res.writeHead(502, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ 
        error: "Bad Gateway", 
        message: "Unable to connect to MCP server",
        details: error instanceof Error ? error.message : String(error)
      }))
    }
    return
  }

  // For all other routes, return 404
  res.writeHead(404, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "Not found" }))
})

// Helper function to read request body
function getRequestBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: any) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      resolve(body)
    })
    req.on('error', reject)
  })
}

// Start the HTTP server
httpServer.listen(port, () => {
  console.log(`🚀 Trademark MCP Server running on http://localhost:${port}`)
  console.log(`📋 Health check: http://localhost:${port}/health`)
  console.log(`🔍 MCP endpoint: http://localhost:${port}/mcp`)
})

// Start FastMCP server with HTTP transport on separate port
server.start({
  transportType: "httpStream", 
  httpStream: {
    port: port + 1, // Use next port for internal MCP server
  },
})
