# MCP Workspace

Streamable HTTP MCP workspace for the local agent starter.

## Behavior

The workspace starts an `@vyriy/server` HTTP handler and exposes:

- `POST /mcp` for MCP Streamable HTTP requests
- `GET /healthcheck` with service metadata

MCP tool registration comes from `@p/mcp`; this workspace only owns HTTP
transport, request handling, and runtime startup.

Current tool surface:

- `ping` returns `pong`

## Local Development

From the repository root:

```bash
yarn dev:mcp
```

Default local values:

- `MCP_PORT=3003`
- `MCP=http://localhost:3003`

## Build

```bash
yarn build:mcp
```

The build emits the server bundle to `dist/mcp/index.js` and copies the
workspace `package.json` into `dist/mcp`.

## Docker

The Dockerfile is runtime-only. Build the workspace first:

```bash
yarn build:mcp
```

Then build the image from the generated workspace output:

```bash
docker build -f workspaces/mcp/Dockerfile dist/mcp
```

Docker Compose exposes the service on `${MCP_PORT}:3000`.

## Validation

```bash
yarn test:jest workspaces/mcp
```

The tests verify HTTP handler creation, MCP request handling, JSON-RPC error
responses, fallback responses, and startup behavior.
