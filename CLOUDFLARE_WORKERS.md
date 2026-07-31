# Cloudflare Workers Setup

This guide explains how to set up and deploy the Cloudflare Workers backend for the NADHILI_DB movie search application.

## Overview

The Cloudflare Workers implementation provides:
- **Edge Computing**: Fast search queries at the edge with Cloudflare's global network
- **Caching**: KV namespace for caching search results (1-hour TTL)
- **Movie Search**: Optimized search endpoint that queries TMDB API
- **Performance**: Reduced latency by serving from edge locations near users

## Prerequisites

1. **Cloudflare Account**: Sign up at https://dash.cloudflare.com/
2. **Wrangler CLI**: Install with `npm install -g @cloudflare/wrangler`
3. **API Keys**: Set up your Cloudflare API token

## Installation

### 1. Install Wrangler Dependencies

```bash
npm install -D wrangler
npm install itty-router
```

### 2. Configure Wrangler

Create a Cloudflare account and get your Account ID:

```bash
wrangler login
```

### 3. Update `wrangler.toml`

Replace the placeholder IDs with your actual values:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-actual-kv-id"
preview_id = "your-actual-preview-id"
```

To create a KV namespace:
```bash
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "CACHE" --preview
```

### 4. Environment Variables

Create a `.env.local` file in your project root:

```env
TMDB_API_KEY=your_tmdb_api_key_here
CURL_AUTH_HEADER=Authorization: Bearer your_token_here
```

## Development

### Local Development

Run the worker locally:

```bash
npm run worker:dev
```

The worker will be available at `http://localhost:8787`

### Testing the Search Endpoint

```bash
# Local testing
curl "http://localhost:8787/api/search?q=inception&type=multi"

# Or using the SearchBar component which automatically uses /api/search
```

## Deployment

### Deploy to Cloudflare Workers

```bash
npm run worker:deploy
```

Your worker will be deployed to: `https://nadhili-db.workers.dev`

### Updating the Frontend

Update the SearchBar component to use the Cloudflare Workers URL in production:

```typescript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://nadhili-db.workers.dev'
  : 'http://localhost:3000'

// Then use: `${API_URL}/api/search?q=...`
```

## Features

### 1. **Search Endpoint** (`/api/search`)

Performs TMDB searches with caching:

```bash
GET /api/search?q=inception&type=multi
```

Parameters:
- `q` (required): Search query
- `type` (optional): 'multi', 'movie', or 'tv' (default: 'multi')

Response includes cache status headers:
- `X-Cache: HIT` - Result from cache
- `X-Cache: MISS` - Fresh query result

### 2. **KV Caching**

Search results are cached in Cloudflare KV for 1 hour:
- Key format: `search:{query}:{type}`
- Fast retrieval on subsequent requests
- Reduced TMDB API calls

### 3. **Health Check** (`/health`)

Monitor worker health:

```bash
curl https://nadhili-db.workers.dev/health
```

Returns: `{"status":"ok"}`

## Performance Benefits

- **Edge Caching**: Results cached at edge servers worldwide
- **Reduced Latency**: Queries respond from nearest edge location
- **API Rate Limiting**: Local caching reduces TMDB API calls
- **Global Distribution**: Automatic geographic distribution

## Monitoring

### View Logs

```bash
wrangler tail
```

### Monitor KV Usage

In Cloudflare Dashboard:
1. Go to Workers → KV → CACHE
2. View storage usage and key management

## Troubleshooting

### Issue: "KV namespace not found"

**Solution**: Create the namespace and update wrangler.toml:
```bash
wrangler kv:namespace create "CACHE"
```

### Issue: "TMDB API error"

**Solution**: Verify TMDB_API_KEY is set:
```bash
wrangler secret put TMDB_API_KEY
# Enter your API key when prompted
```

### Issue: High response times

**Solution**: Check cache hit rate:
- Use `X-Cache` header in responses
- Verify KV namespace is properly configured

## Next Steps

1. Deploy the worker: `npm run worker:deploy`
2. Update production URLs to use the Cloudflare domain
3. Monitor performance in Cloudflare Dashboard
4. Set up custom domain (optional)

## Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Guide](https://developers.cloudflare.com/workers/wrangler/)
- [KV Namespace Guide](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [itty-router Documentation](https://github.com/kwhitley/itty-router)
