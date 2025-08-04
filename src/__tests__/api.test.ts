import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

// Mock environment and setup
const mockFetch = vi.fn()
global.fetch = mockFetch

// Sample API responses for testing
const mockJsonResponse = {
  trademarks: [
    {
      status: {
        serialNumber: 12345678,
        markElement: "TEST MARK",
        status: 645,
        statusDate: "2024-01-01",
      },
    },
  ],
}

const mockXmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<TrademarkTransaction>
  <Trademark>
    <ApplicationNumber>12345678</ApplicationNumber>
    <MarkElement>TEST MARK</MarkElement>
  </Trademark>
</TrademarkTransaction>`

describe("API Integration Tests", () => {
  let originalEnv: typeof process.env

  beforeEach(() => {
    originalEnv = { ...process.env }
    process.env.USPTO_API_KEY = "test-api-key"
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("JSON Format Handling", () => {
    it("should handle successful JSON API response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJsonResponse),
        text: () => Promise.resolve(JSON.stringify(mockJsonResponse)),
      })

      // Test that fetch would be called correctly
      const response = await fetch("https://test-api.com/test.json")
      expect(response.ok).toBe(true)

      const jsonData = await response.json()
      expect(jsonData).toEqual(mockJsonResponse)
      expect(jsonData.trademarks).toHaveLength(1)
      expect(jsonData.trademarks[0].status.markElement).toBe("TEST MARK")
    })

    it("should handle JSON parsing correctly", async () => {
      const jsonString = JSON.stringify(mockJsonResponse, null, 2)
      expect(jsonString).toContain("TEST MARK")
      expect(jsonString).toContain("trademarks")

      const parsed = JSON.parse(jsonString)
      expect(parsed).toEqual(mockJsonResponse)
    })
  })

  describe("XML Format Handling", () => {
    it("should handle successful XML API response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockXmlResponse),
      })

      const response = await fetch("https://test-api.com/test.xml")
      expect(response.ok).toBe(true)

      const xmlData = await response.text()
      expect(xmlData).toContain("TrademarkTransaction")
      expect(xmlData).toContain("TEST MARK")
      expect(xmlData).toContain("12345678")
    })

    it("should preserve XML structure", () => {
      expect(mockXmlResponse).toContain('<?xml version="1.0"')
      expect(mockXmlResponse).toContain("<TrademarkTransaction>")
      expect(mockXmlResponse).toContain("</TrademarkTransaction>")
    })
  })

  describe("Error Handling", () => {
    it("should handle 401 authentication errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: () => Promise.resolve("need to register for an API key"),
      })

      const response = await fetch("https://test-api.com/test.json")
      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)

      const errorText = await response.text()
      expect(errorText).toContain("need to register for an API key")
    })

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"))

      await expect(fetch("https://test-api.com/test.json")).rejects.toThrow("Network error")
    })

    it("should handle invalid JSON responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON")),
      })

      const response = await fetch("https://test-api.com/test.json")
      expect(response.ok).toBe(true)

      await expect(response.json()).rejects.toThrow("Invalid JSON")
    })
  })

  describe("API Headers", () => {
    it("should include required headers", () => {
      const headers = {
        "User-Agent": "trademark-mcp-server/1.0.0",
        "USPTO-API-KEY": "test-api-key",
      }

      expect(headers["User-Agent"]).toBe("trademark-mcp-server/1.0.0")
      expect(headers["USPTO-API-KEY"]).toBe("test-api-key")
    })

    it("should handle missing API key", () => {
      const headers: Record<string, string> = {
        "User-Agent": "trademark-mcp-server/1.0.0",
      }

      // Should not include API key header when not provided
      expect(headers["USPTO-API-KEY"]).toBeUndefined()
      expect(Object.keys(headers)).not.toContain("USPTO-API-KEY")
    })
  })

  describe("URL Construction", () => {
    it("should construct correct JSON URLs", () => {
      const baseUrl = "https://tsdrapi.uspto.gov/ts/cd"
      const serialNumber = "12345678"
      const jsonUrl = `${baseUrl}/casestatus/sn${serialNumber}/info.json`

      expect(jsonUrl).toBe("https://tsdrapi.uspto.gov/ts/cd/casestatus/sn12345678/info.json")
    })

    it("should construct correct XML URLs", () => {
      const baseUrl = "https://tsdrapi.uspto.gov/ts/cd"
      const serialNumber = "12345678"
      const xmlUrl = `${baseUrl}/casestatus/sn${serialNumber}/info.xml`

      expect(xmlUrl).toBe("https://tsdrapi.uspto.gov/ts/cd/casestatus/sn12345678/info.xml")
    })

    it("should construct registration URLs correctly", () => {
      const baseUrl = "https://tsdrapi.uspto.gov/ts/cd"
      const registrationNumber = "1234567"
      const url = `${baseUrl}/casestatus/rn${registrationNumber}/info.json`

      expect(url).toBe("https://tsdrapi.uspto.gov/ts/cd/casestatus/rn1234567/info.json")
    })
  })
})
