# Trademark MCP Server

A Model Context Protocol (MCP) server that provides tools for searching and retrieving USPTO trademark information using the TSDR API.

## Features

This MCP server provides the following tools:

- **trademark_search_by_serial**: Search for trademark information using an 8-digit serial number
- **trademark_search_by_registration**: Search for trademark information using a 7-8 digit registration number
- **trademark_status**: Get comprehensive status information for a trademark (HTML format)
- **trademark_image**: Retrieve trademark image URLs
- **trademark_documents**: Get document bundle URLs for a trademark

## Installation

```bash
pnpm install
pnpm build
```

## Usage

### As an MCP Server (stdio)

```bash
pnpm start
# or directly
node dist/bin.js
```

### As an HTTP Server

```bash
pnpm serve
# or directly
node dist/server.js
```

The HTTP server will run on port 8080 by default (configurable via `PORT` environment variable):
- Health check: `http://localhost:8080/health`
- MCP endpoint: `http://localhost:8080/mcp`

### Development

```bash
# Run in development mode with file watching
pnpm serve:dev

# Run with MCP Inspector for debugging
pnpm dev

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

## API Endpoints Used

This server uses the USPTO TSDR (Trademark Status & Document Retrieval) API:

- Base URL: `https://tsdrapi.uspto.gov/ts/cd`
- **Status Info (JSON)**: `/casestatus/sn[SERIAL]/info.json` or `/casestatus/rn[REGISTRATION]/info.json`
- **Status Info (HTML)**: `/casestatus/sn[SERIAL]/content.html`
- **Trademark Images**: `/rawImage/[SERIAL]`
- **Document Bundles**: `/casedocs/bundle.pdf?sn=[SERIAL]`

### Rate Limits

- General API calls: 60 requests per minute per API key
- PDF/ZIP downloads: 4 requests per minute per API key

## Example Usage

### Search by Serial Number

```typescript
// Example serial number: 78787878
{
  "name": "trademark_search_by_serial",
  "arguments": {
    "serialNumber": "78787878"
  }
}
```

### Search by Registration Number

```typescript
// Example registration number: 1234567
{
  "name": "trademark_search_by_registration", 
  "arguments": {
    "registrationNumber": "1234567"
  }
}
```

### Get Trademark Image

```typescript
{
  "name": "trademark_image",
  "arguments": {
    "serialNumber": "78787878"
  }
}
```

## Configuration for Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "trademark-mcp-server": {
      "command": "node",
      "args": ["/path/to/trademark-mcp-server/dist/bin.js"]
    }
  }
}
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting: `pnpm test && pnpm lint`
5. Submit a pull request

## API Reference

For more information about the USPTO TSDR API, visit:
- [USPTO Developer Portal](https://developer.uspto.gov/api-catalog/tsdr-data-api)
- [TSDR API Swagger Documentation](https://developer.uspto.gov/swagger/tsdr-api-v1)