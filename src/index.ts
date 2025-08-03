import { FastMCP } from "fastmcp"
import { z } from "zod"

const server = new FastMCP({
  name: "trademark-mcp-server",
  version: "1.0.0",
  instructions: `
This MCP server provides tools for searching and retrieving USPTO trademark information using the TSDR API.

Available tools:
- trademark_search: Search for trademarks by serial number, registration number, or owner name
- trademark_status: Get detailed status information for a specific trademark
- trademark_image: Retrieve trademark image URLs
- trademark_documents: Get document bundle URLs for a trademark

The server uses the USPTO TSDR (Trademark Status & Document Retrieval) API to provide real-time trademark data.
Rate limits: 60 requests per minute for general API calls, 4 requests per minute for PDF/ZIP downloads.
`,
})

// Base TSDR API URL
const TSDR_BASE_URL = "https://tsdrapi.uspto.gov/ts/cd"

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
    try {
      const url = `${TSDR_BASE_URL}/casestatus/sn${args.serialNumber}/info.json`

      const response = await fetch(url, {
        headers: {
          "User-Agent": "trademark-mcp-server/1.0.0",
        },
      })

      if (!response.ok) {
        throw new Error(`USPTO API returned ${response.status}: ${response.statusText}`)
      }

      const data = (await response.json()) as Record<string, unknown>

      return JSON.stringify(data, null, 2)
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
    try {
      const url = `${TSDR_BASE_URL}/casestatus/sn${args.serialNumber}/content.html`

      const response = await fetch(url, {
        headers: {
          "User-Agent": "trademark-mcp-server/1.0.0",
        },
      })

      if (!response.ok) {
        throw new Error(`USPTO API returned ${response.status}: ${response.statusText}`)
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
    try {
      const imageUrl = `${TSDR_BASE_URL}/rawImage/${args.serialNumber}`

      // Test if the image exists by making a HEAD request
      const response = await fetch(imageUrl, {
        method: "HEAD",
        headers: {
          "User-Agent": "trademark-mcp-server/1.0.0",
        },
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
  }),
  annotations: {
    title: "Trademark Search by Registration Number",
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async (args) => {
    try {
      const url = `${TSDR_BASE_URL}/casestatus/rn${args.registrationNumber}/info.json`

      const response = await fetch(url, {
        headers: {
          "User-Agent": "trademark-mcp-server/1.0.0",
        },
      })

      if (!response.ok) {
        throw new Error(`USPTO API returned ${response.status}: ${response.statusText}`)
      }

      const data = (await response.json()) as Record<string, unknown>

      return JSON.stringify(data, null, 2)
    } catch (error) {
      return `Error fetching trademark data by registration number: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})

export default server
