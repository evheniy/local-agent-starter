# MCP service

The repository exposes a stateless, read-only Model Context Protocol server at:

```text
http://localhost:3003/mcp
```

It uses MCP **Streamable HTTP**. The route accepts MCP requests with `POST`; it
is not an SSE-only or stdio server, and the current transport does not create
persistent server sessions.

## Run and check it

With Docker, `yarn start` includes the `mcp` service. For workspace development:

```bash
yarn dev:mcp
```

The transport-independent health endpoint is:

```bash
curl http://localhost:3003/healthcheck
```

It returns service metadata. This checks the HTTP process, not embeddings,
Postgres contents, or chat inference. The MCP `ping` tool checks protocol-level
tool invocation.

## Available tools

| Tool               | Input                                                                    | Output intent                                                           |
| ------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `ping`             | none                                                                     | Text `pong`                                                             |
| `list_documents`   | optional `status`: `uploaded`, `indexing`, `indexed`, or `error`         | JSON document ids, names, paths, statuses, chunk counts, and timestamps |
| `search_documents` | required non-empty `query`; optional integer `limit` 1–10 (default 5)    | JSON relevant chunk text, score, document/path, and chunk index         |
| `ask_documents`    | required non-empty `question`; optional integer `limit` 1–10 (default 5) | JSON non-streaming answer and compact sources                           |

All document tools are read-only: they do not upload, index, edit, or delete
files. `search_documents` uses the shared embedding and pgvector retrieval
services. `ask_documents` additionally uses the shared non-streaming RAG/chat
service. This keeps MCP behavior aligned with the web application.

## Client configuration

Use a client that supports remote MCP Streamable HTTP and configure the URL
`http://localhost:3003/mcp`. A common URL-based shape is:

```json
{
  "mcpServers": {
    "local-agent": {
      "url": "http://localhost:3003/mcp"
    }
  }
}
```

Client configuration keys vary, so confirm that client's Streamable HTTP
documentation. Do not configure this endpoint as an executable stdio command.

## Test procedure

1. Start LM Studio and the Compose stack.
2. Check `/healthcheck`.
3. Upload a supported file and wait until it is Ready/`indexed`.
4. Connect an MCP Inspector or another Streamable HTTP client to `/mcp`.
5. List tools and call `ping`.
6. Call `list_documents` with `{}`.
7. Call `search_documents` with
   `{"query":"What is an agent?","limit":5}`.
8. Call `ask_documents` with
   `{"question":"What is an agent?","limit":5}`.

If the protocol connects but document tools fail, inspect
`docker compose logs -f mcp`, Postgres state, and LM Studio connectivity.

## Current limitations

There is no authentication, authorization, TLS termination, write tool,
persistent MCP session, streaming answer tool, resource/prompt surface, or
per-client data isolation. The service is intended for trusted local
development, not exposure to an untrusted network.
