# USPTO TSDR API Reference Guide

*Based on USPTO TSDR API Key Manager User Guide (September 2020)*

## Overview

The USPTO Trademark Status and Document Retrieval (TSDR) API provides programmatic access to trademark data through a REST API. Access requires an API key obtained through the USPTO API Key Manager.

## Authentication

### API Key Requirements
- **Format**: Approximately 40-character string value
- **Purpose**: Uniquely identifies users and provides API access
- **Security**: Must be kept private and not shared
- **Header**: Include as `USPTO-API-KEY` in request headers

### Obtaining an API Key
1. Sign in to the API Key Manager at https://account.uspto.gov/api-manager/
2. Create a USPTO.gov account if you don't have one
3. Select "TSDR (Trademark Search and Data Retrieval) API"
4. Click "Request API key" button
5. Your API key is automatically generated and saved

## Rate Limits

### Standard Rate Limits (5 AM - 10 PM EST)
- **General requests**: 60 requests per API key per minute
- **PDF/ZIP downloads**: 4 requests per API key per minute
- **Multi-case PDF/ZIP downloads**: 4 requests per API key per minute

### Off-Peak Rate Limits (10 PM - 5 AM EST, 7 days/week)
- **General requests**: 120 requests per API key per minute
- **PDF/ZIP downloads**: 12 requests per API key per minute
- **Multi-case PDF/ZIP downloads**: 12 requests per API key per minute

### Rate Limit Response
- **Success**: HTTP 200 status code
- **Rate limit exceeded**: HTTP 429 status code

## API Endpoints

### Base URL
```
https://tsdrapi.uspto.gov/ts/cd/
```

### Case Status Endpoints

#### Get Case Status (HTML)
```
GET /casestatus/sn{serialNumber}/content
```
**Example**: `https://tsdrapi.uspto.gov/ts/cd/casestatus/sn78787878/content`

#### Get Case Status (XML)
```
GET /casestatus/sn{serialNumber}/info.xml
```
**Example**: `https://tsdrapi.uspto.gov/ts/cd/casestatus/sn78787878/info.xml`

#### Get Case Status (PDF)
```
GET /casestatus/sn{serialNumber}/download.pdf
```
**Example**: `https://tsdrapi.uspto.gov/ts/cd/casestatus/sn78787878/download.pdf`

#### Get Case Status (ZIP with XML/CSS)
```
GET /casestatus/sn{serialNumber}/content.zip
```
**Example**: `https://tsdrapi.uspto.gov/ts/cd/casestatus/sn75757575/content.zip`

### Document Bundle Endpoints

#### Get All Documents for Serial Number
```
GET /casedocs/bundle.pdf?sn={serialNumber}
GET /casedocs/bundle.xml?sn={serialNumber}
GET /casedocs/bundle.zip?sn={serialNumber}
```
**Example**: `https://tsdrapi.uspto.gov/ts/cd/casedocs/bundle.pdf?sn=72131351`

#### Get All Documents for Registration Number
```
GET /casedocs/bundle.pdf?rn={registrationNumber}
```
**Example**: `https://tsdrapi.uspto.gov/ts/cd/casedocs/bundle.pdf?rn=3500030`

#### Get All Documents for Reference Number
```
GET /casedocs/bundle.pdf?ref={referenceNumber}
```
**Example**: `https://tsdrapi.uspto.gov/ts/cd/casedocs/bundle.pdf?ref=Z1231384`

#### Get All Documents for International Registration
```
GET /casedocs/bundle.xml?ir={internationalRegistrationNumber}
```
**Example**: `https://tsdrapi.uspto.gov/ts/cd/casedocs/bundle.xml?ir=0835690&sort=date:A`

### Image Endpoints

#### Get Full-Size Trademark Image
```
GET /rawImage/{serialNumber}
```
**Example**: `https://tsdrapi.uspto.gov/ts/cd/rawImage/78787878`

## Query Parameters

### Date Filtering
- `date`: Specific date (YYYY-MM-DD format)
- `fromDate`: Start date for range filtering
- `toDate`: End date for range filtering

**Example**: `?sn=72131351&date=2003-11-30`
**Example**: `?sn=75008897&fromDate=2006-01-01&toDate=2006-12-31`

### Document Type Filtering
- `type`: Filter by document type (e.g., `SPE` for specimens)
- `category`: Filter by document category (e.g., `RC` for registration certificates)

**Example**: `?sn=72131351,76515878&type=SPE`
**Example**: `?rn=3500038&category=RC`

### Multiple Serial Numbers
Separate multiple serial numbers with commas:
**Example**: `?sn=72131351,76515878`
**Example**: `?rn=3500038,3500039`

### Sorting
- `sort`: Sort results by date
  - `date:A` - Ascending (earliest to latest)
  - `date:D` - Descending (latest to earliest)

**Example**: `?ir=0835690&sort=date:A`

## Response Formats

### Supported Formats
- **HTML**: Human-readable web format
- **XML**: Machine-readable structured data
- **PDF**: Formatted document download
- **ZIP**: Archive containing multiple files
- **TIFF**: Original image format (in ZIP archives)

### Content Types
- `text/html` - HTML responses
- `application/xml` - XML responses  
- `application/pdf` - PDF documents
- `application/zip` - ZIP archives
- `image/tiff` - TIFF images

## Usage Examples

### Using cURL
```bash
curl -i \
  -o trademark_status.pdf \
  -H "USPTO-API-KEY: your_api_key_here" \
  -X GET https://tsdrapi.uspto.gov/ts/cd/casestatus/sn78787878/download.pdf
```

### Using Postman
1. Set HTTP method to `GET`
2. Enter the TSDR API URL
3. Add header: `USPTO-API-KEY` with your API key value
4. Send request
5. For PDF/ZIP responses, use "Save Response" → "Save to File"

### Using JavaScript/Node.js
```javascript
const response = await fetch('https://tsdrapi.uspto.gov/ts/cd/casestatus/sn78787878/info.xml', {
  headers: {
    'USPTO-API-KEY': 'your_api_key_here'
  }
});

if (response.ok) {
  const xmlData = await response.text();
  console.log(xmlData);
} else {
  console.error('API request failed:', response.status);
}
```

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **400**: Bad Request (invalid parameters)
- **401**: Unauthorized (missing or invalid API key)
- **404**: Not Found (invalid serial number or endpoint)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

### Rate Limit Headers
When approaching rate limits, check these response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when rate limit resets

## Best Practices

### API Key Security
- Store API keys as environment variables
- Never commit API keys to version control
- Rotate API keys regularly
- Use HTTPS for all requests

### Rate Limit Management
- Implement exponential backoff for 429 responses
- Cache responses when possible
- Use off-peak hours (10 PM - 5 AM EST) for bulk operations
- Monitor rate limit headers

### Error Handling
- Implement retry logic for transient errors
- Log API responses for debugging
- Validate serial numbers before making requests
- Handle different response formats appropriately

## Sample URLs Reference

| Purpose | URL Pattern | Example |
|---------|-------------|---------|
| Status (PDF) | `/casestatus/sn{sn}/download.pdf` | `sn78787878/download.pdf` |
| Status (XML) | `/casestatus/sn{sn}/info.xml` | `sn78787878/info.xml` |
| Status (HTML) | `/casestatus/sn{sn}/content` | `sn78787878/content` |
| Status (ZIP) | `/casestatus/sn{sn}/content.zip` | `sn75757575/content.zip` |
| All Documents | `/casedocs/bundle.pdf?sn={sn}` | `?sn=72131351` |
| Documents by Date | `/casedocs/bundle.pdf?sn={sn}&date={date}` | `?sn=72131351&date=2003-11-30` |
| Specimens | `/casedocs/bundle.pdf?sn={sn}&type=SPE` | `?sn=72131351,76515878&type=SPE` |
| Registration Cert | `/casedocs/bundle.pdf?rn={rn}&category=RC` | `?rn=3500038&category=RC` |
| Trademark Image | `/rawImage/{sn}` | `/rawImage/78787878` |
| Metadata (XML) | `/casedocs/bundle.xml?sn={sn}` | `?sn=75008897&fromDate=2006-01-01` |

## Resources

- **API Key Manager**: https://account.uspto.gov/api-manager/
- **USPTO Developer Portal**: https://developer.uspto.gov/
- **Create USPTO Account**: http://my.uspto.gov/
- **Technical Support**: Contact USPTO developer support

---

*This reference is based on the USPTO TSDR API Key Manager User Guide from September 2020. API specifications may change over time. Always refer to the official USPTO documentation for the most current information.*