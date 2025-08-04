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

## ⚠️ API Key Required

**Important**: The USPTO TSDR API requires an API key since October 2020. You must:

1. **Register** at [USPTO Developer Portal](https://developer.uspto.gov/)
2. **Get your API key** from your account dashboard  
3. **Set environment variable**: `USPTO_API_KEY=your_api_key_here`

Without an API key, all requests will return 401 Unauthorized errors.

## Usage

### Using npx (Recommended)

You can run the server directly using npx without installing:

```bash
# Set your API key first
export USPTO_API_KEY=your_api_key_here

# Then run the server
npx trademark-mcp-server
```

This will start the MCP server in stdio mode, ready to receive MCP protocol messages.

### As an MCP Server (stdio)

If you have the package installed locally:

```bash
pnpm start
# or directly
node dist/bin.js
```

### Using the Shell Script

A convenience shell script is provided:

```bash
./start-mcp-server.sh
```

### As an HTTP Server

```bash
# Set your API key first
export USPTO_API_KEY=your_api_key_here

# Then run the server
pnpm serve
# or directly
node dist/server.js
```

The HTTP server will run on port 8080 by default (configurable via `PORT` environment variable):
- Health check: `http://localhost:8080/health`
- MCP endpoint: `http://localhost:8080/mcp`

### Development

```bash
# Set your API key first
export USPTO_API_KEY=your_api_key_here

# Run in development mode with file watching
pnpm serve:dev

# Run with MCP Inspector for debugging and testing
pnpm inspect
# or use the convenience script
./inspect-server.sh

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

### Testing with MCP Inspector

The MCP Inspector provides a web-based interface for testing MCP servers:

```bash
# Start the inspector (opens browser at http://localhost:5173)
pnpm inspect

# Or use the standalone script
./inspect-server.sh
```

The inspector allows you to:
- **Test all tools** interactively through a web UI
- **View server capabilities** and available tools
- **Send requests** and see responses in real-time
- **Debug issues** with detailed logging
- **Validate** MCP protocol compliance

## API Endpoints Used

This server uses the USPTO TSDR (Trademark Status & Document Retrieval) API:

- Base URL: `https://tsdrapi.uspto.gov/ts/cd`
- **Status Info (JSON)**: `/casestatus/sn[SERIAL]/info.json` or `/casestatus/rn[REGISTRATION]/info.json`
- **Status Info (HTML)**: `/casestatus/sn[SERIAL]/content.html`
- **Trademark Images**: `/rawImage/[SERIAL]`
- **Document Bundles**: `/casedocs/bundle.pdf?sn=[SERIAL]`

### Getting an API Key

1. Visit [USPTO Developer Portal](https://developer.uspto.gov/)
2. Create an account or log in
3. Navigate to your account dashboard
4. Generate a new API key for TSDR access
5. Copy your API key for use with this server

For questions about API keys, contact: `APIhelp@uspto.gov`

### Rate Limits

- General API calls: 60 requests per minute per API key
- PDF/ZIP downloads: 4 requests per minute per API key

## Example Usage

You can test these examples using the MCP Inspector (`pnpm inspect`) or by calling the tools directly.

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

### Test with Real Data

Try these working examples in the MCP Inspector:
- **Apple trademark**: Serial number `78462704`
- **Nike trademark**: Serial number `72016902`
- **Microsoft trademark**: Serial number `78213220`

## Configuration for Claude Desktop

### Using npx (Recommended)

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "trademark-mcp-server": {
      "command": "npx",
      "args": ["trademark-mcp-server"],
      "env": {
        "USPTO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Using Local Installation

If you have the package installed locally:

```json
{
  "mcpServers": {
    "trademark-mcp-server": {
      "command": "node",
      "args": ["/path/to/trademark-mcp-server/dist/bin.js"],
      "env": {
        "USPTO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Using Shell Script

You can also use the provided shell script:

```json
{
  "mcpServers": {
    "trademark-mcp-server": {
      "command": "/path/to/trademark-mcp-server/start-mcp-server.sh",
      "env": {
        "USPTO_API_KEY": "your_api_key_here"
      }
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