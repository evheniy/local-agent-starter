# MCP HTTP

HTTP transport helpers for the local agent MCP server.

## Exports

- `createHttpHandler()` creates the Vyriy HTTP API handler with `/mcp`,
  fallback, CORS-style headers, and healthcheck metadata.
- `createMcpRequestHandler()` handles one Streamable HTTP MCP request.
- `startHttpServer()` starts the HTTP server and logs the bound `/mcp` URL.
- `readJsonBody()` reads and parses an incoming request body.
- `json()` writes JSON responses.
- `jsonRpcError()` writes JSON-RPC error responses.
- `HTTP_HEADERS`, `HEALTHCHECK_BODY`, and `MCP_PATH` expose shared transport
  constants.

## Behavior

The package owns Streamable HTTP transport behavior. MCP tools and server
registration still live in `@p/mcp`; workspace startup lives in
`workspaces/mcp`.

For each `POST /mcp` request, the handler creates an MCP server, connects it to
a stateless `StreamableHTTPServerTransport`, delegates request handling, then
closes both transport and server.

## Usage

```ts
import { startHttpServer } from '@p/mcp-http';

void startHttpServer();
```

## Validation

```bash
yarn test:jest packages/mcp-http
```

The root Jest config enforces 100% coverage when the full suite runs.
