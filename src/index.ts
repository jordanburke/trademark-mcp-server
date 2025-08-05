import { FastMCP } from "fastmcp"
import { z } from "zod"

const server = new FastMCP({
  name: "trademark-mcp-server",
  version: "1.0.0",
  instructions: `
This MCP server provides tools for searching and retrieving USPTO trademark information using the TSDR API.

Available tools:
- trademark_search_by_serial: Search for trademarks by 8-digit serial number
- trademark_search_by_registration: Search for trademarks by 7-8 digit registration number  
- trademark_status: Get detailed status information for a specific trademark
- trademark_image: Retrieve trademark image URLs
- trademark_documents: Get document bundle URLs for a trademark

The server uses the USPTO TSDR (Trademark Status & Document Retrieval) API to provide real-time trademark data.
Rate limits: 60 requests per minute for general API calls, 4 requests per minute for PDF/ZIP downloads.

IMPORTANT: An API key is required to access the USPTO TSDR API (since October 2020).
Set the USPTO_API_KEY environment variable with your API key from https://developer.uspto.gov/
`,
  health: {
    enabled: true,
    message: JSON.stringify({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      service: "trademark-mcp-server",
    }),
    path: "/health",
    status: 200,
  },
})

// Base TSDR API URL
const TSDR_BASE_URL = "https://tsdrapi.uspto.gov/ts/cd"

// API Key for USPTO TSDR API (required since October 2020)
const API_KEY = process.env.USPTO_API_KEY

// Helper function to get headers with API key
function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "trademark-mcp-server/1.0.0",
  }

  if (API_KEY) {
    headers["USPTO-API-KEY"] = API_KEY
  }

  return headers
}

// Helper function to check if API key is configured
function checkApiKey(): string | null {
  if (!API_KEY) {
    return "❌ USPTO API key not configured. Please set the USPTO_API_KEY environment variable with your API key from https://account.uspto.gov/api-manager/"
  }
  return null
}

// Trademark search by serial number
server.addTool({
  name: "trademark_search_by_serial",
  description: "Search for trademark information using a serial number",
  parameters: z.object({
    serialNumber: z.string().min(8).max(8).describe("8-digit trademark serial number"),
    format: z.enum(["json", "xml"]).default("json").describe("Response format"),
  }),
  annotations: {
    title: "Trademark Search by Serial Number",
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async (args) => {
    const apiKeyError = checkApiKey()
    if (apiKeyError) {
      return apiKeyError
    }

    try {
      // Use JSON or XML endpoint based on format parameter
      const fileExtension = args.format === "json" ? "json" : "xml"
      const url = `${TSDR_BASE_URL}/casestatus/sn${args.serialNumber}/info.${fileExtension}`

      const response = await fetch(url, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (errorText.includes("need to register for an API key")) {
          throw new Error(`🔑 USPTO API Authentication Issue

The USPTO TSDR API is rejecting our API key. This could be due to:

1. **API Key Activation Delay**: New keys may need 24-48 hours to activate
2. **Endpoint Restrictions**: Individual record endpoints may be temporarily disabled
3. **Authentication Method**: The API might require a different authentication format

**Your API Key**: ${API_KEY ? `${API_KEY.substring(0, 8)}...` : "Not set"}

**Next Steps**:
• Contact USPTO support: APIhelp@uspto.gov 
• Include your API key and this error message
• Ask specifically about individual record endpoint access

**Alternative**: Try bulk data download endpoints if available.`)
        }
        throw new Error(`USPTO API returned ${response.status}: ${response.statusText}. Error: ${errorText}`)
      }

      // Parse response based on format
      if (args.format === "json") {
        const jsonData = await response.json()
        return JSON.stringify(jsonData, null, 2)
      } else {
        const xmlData = await response.text()
        return xmlData
      }
    } catch (error) {
      return `Error fetching trademark data: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})

// Trademark status lookup
server.addTool({
  name: "trademark_status",
  description: "Get comprehensive status information for a trademark by serial number",
  parameters: z.object({
    serialNumber: z.string().min(8).max(8).describe("8-digit trademark serial number"),
  }),
  annotations: {
    title: "Trademark Status Lookup",
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async (args) => {
    const apiKeyError = checkApiKey()
    if (apiKeyError) {
      return apiKeyError
    }

    try {
      const url = `${TSDR_BASE_URL}/casestatus/sn${args.serialNumber}/content`

      const response = await fetch(url, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (errorText.includes("need to register for an API key")) {
          throw new Error(`🔑 USPTO API Authentication Issue

The USPTO TSDR API is rejecting our API key. This could be due to:

1. **API Key Activation Delay**: New keys may need 24-48 hours to activate
2. **Endpoint Restrictions**: Individual record endpoints may be temporarily disabled
3. **Authentication Method**: The API might require a different authentication format

**Your API Key**: ${API_KEY ? `${API_KEY.substring(0, 8)}...` : "Not set"}

**Next Steps**:
• Contact USPTO support: APIhelp@uspto.gov 
• Include your API key and this error message
• Ask specifically about individual record endpoint access

**Alternative**: Try bulk data download endpoints if available.`)
        }
        throw new Error(`USPTO API returned ${response.status}: ${response.statusText}. Error: ${errorText}`)
      }

      const htmlContent = await response.text()

      // Extract key information from HTML (basic parsing)
      const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i)
      const title = titleMatch ? titleMatch[1] : "No title found"

      return `Trademark Status Report for Serial Number: ${args.serialNumber}\n\nTitle: ${title}\n\nFull HTML content available at: ${url}\n\nNote: This tool returns the HTML content from the USPTO. For structured data, use trademark_search_by_serial instead.`
    } catch (error) {
      return `Error fetching trademark status: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})

// Trademark image retrieval
server.addTool({
  name: "trademark_image",
  description: "Get the image URL for a trademark by serial number",
  parameters: z.object({
    serialNumber: z.string().min(8).max(8).describe("8-digit trademark serial number"),
  }),
  annotations: {
    title: "Trademark Image Retrieval",
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async (args) => {
    const apiKeyError = checkApiKey()
    if (apiKeyError) {
      return apiKeyError
    }

    try {
      const imageUrl = `${TSDR_BASE_URL}/rawImage/${args.serialNumber}`

      // Test if the image exists by making a HEAD request
      const response = await fetch(imageUrl, {
        method: "HEAD",
        headers: getHeaders(),
      })

      if (!response.ok) {
        return `No image found for trademark serial number: ${args.serialNumber}`
      }

      return `Trademark image URL for serial number ${args.serialNumber}: ${imageUrl}\n\nYou can view this image by opening the URL in a web browser.`
    } catch (error) {
      return `Error retrieving trademark image: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})

// Trademark documents bundle
server.addTool({
  name: "trademark_documents",
  description: "Get the document bundle URL for a trademark by serial number",
  parameters: z.object({
    serialNumber: z.string().min(8).max(8).describe("8-digit trademark serial number"),
  }),
  annotations: {
    title: "Trademark Documents Bundle",
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async (args) => {
    const apiKeyError = checkApiKey()
    if (apiKeyError) {
      return apiKeyError
    }

    try {
      const documentsUrl = `${TSDR_BASE_URL}/casedocs/bundle.pdf?sn=${args.serialNumber}`

      return `Document bundle URL for trademark serial number ${args.serialNumber}: ${documentsUrl}\n\nThis URL provides a PDF containing all documents related to this trademark application.\n\nNote: Document downloads are rate-limited to 4 requests per minute per API key.`
    } catch (error) {
      return `Error generating document bundle URL: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})

// Advanced trademark search by registration number
server.addTool({
  name: "trademark_search_by_registration",
  description: "Search for trademark information using a registration number",
  parameters: z.object({
    registrationNumber: z.string().min(7).max(8).describe("7-8 digit trademark registration number"),
    format: z.enum(["json", "xml"]).default("json").describe("Response format"),
  }),
  annotations: {
    title: "Trademark Search by Registration Number",
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async (args) => {
    const apiKeyError = checkApiKey()
    if (apiKeyError) {
      return apiKeyError
    }

    try {
      // Use JSON or XML endpoint based on format parameter
      const fileExtension = args.format === "json" ? "json" : "xml"
      const url = `${TSDR_BASE_URL}/casestatus/rn${args.registrationNumber}/info.${fileExtension}`

      const response = await fetch(url, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (errorText.includes("need to register for an API key")) {
          throw new Error(`🔑 USPTO API Authentication Issue

The USPTO TSDR API is rejecting our API key. This could be due to:

1. **API Key Activation Delay**: New keys may need 24-48 hours to activate
2. **Endpoint Restrictions**: Individual record endpoints may be temporarily disabled
3. **Authentication Method**: The API might require a different authentication format

**Your API Key**: ${API_KEY ? `${API_KEY.substring(0, 8)}...` : "Not set"}

**Next Steps**:
• Contact USPTO support: APIhelp@uspto.gov 
• Include your API key and this error message
• Ask specifically about individual record endpoint access

**Alternative**: Try bulk data download endpoints if available.`)
        }
        throw new Error(`USPTO API returned ${response.status}: ${response.statusText}. Error: ${errorText}`)
      }

      // Parse response based on format
      if (args.format === "json") {
        const jsonData = await response.json()
        return JSON.stringify(jsonData, null, 2)
      } else {
        const xmlData = await response.text()
        return xmlData
      }
    } catch (error) {
      return `Error fetching trademark data by registration number: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})

export default server
