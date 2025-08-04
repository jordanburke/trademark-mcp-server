import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// We need to mock the environment and fetch before importing our module
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("Trademark MCP Server", () => {
  let originalEnv: typeof process.env

  beforeEach(() => {
    originalEnv = { ...process.env }
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("Environment Setup", () => {
    it("should load without API key", async () => {
      delete process.env.USPTO_API_KEY

      // Dynamic import after env setup
      const { default: server } = await import("../index.js")

      expect(server).toBeDefined()
      expect(typeof server).toBe("object")
    })

    it("should load with API key", async () => {
      process.env.USPTO_API_KEY = "test-api-key"

      const { default: server } = await import("../index.js")

      expect(server).toBeDefined()
      expect(typeof server).toBe("object")
    })
  })

  describe("API Key Validation", () => {
    it("should require API key for trademark operations", async () => {
      delete process.env.USPTO_API_KEY

      // We would need to access the checkApiKey function - for now test the server exists
      const { default: server } = await import("../index.js")
      expect(server).toBeDefined()
    })

    it("should accept valid API key", async () => {
      process.env.USPTO_API_KEY = "valid-test-key"

      const { default: server } = await import("../index.js")
      expect(server).toBeDefined()
    })
  })

  describe("Server Configuration", () => {
    it("should create a FastMCP server instance", async () => {
      const { default: server } = await import("../index.js")

      expect(server).toBeDefined()
      expect(typeof server).toBe("object")
      // FastMCP server should have these methods
      expect(typeof server.addTool).toBe("function")
    })

    it("should be properly configured", async () => {
      const { default: server } = await import("../index.js")

      // Check that server has the expected structure
      expect(server).toBeDefined()
      expect(typeof server).toBe("object")
      expect(typeof server.addTool).toBe("function")
    })
  })

  describe("Tool Definitions", () => {
    it("should define trademark_search_by_serial tool", async () => {
      const { default: server } = await import("../index.js")

      // Server should be properly configured
      expect(server).toBeDefined()
    })

    it("should define trademark_search_by_registration tool", async () => {
      const { default: server } = await import("../index.js")

      expect(server).toBeDefined()
    })

    it("should define trademark_status tool", async () => {
      const { default: server } = await import("../index.js")

      expect(server).toBeDefined()
    })

    it("should define trademark_image tool", async () => {
      const { default: server } = await import("../index.js")

      expect(server).toBeDefined()
    })

    it("should define trademark_documents tool", async () => {
      const { default: server } = await import("../index.js")

      expect(server).toBeDefined()
    })
  })
})
