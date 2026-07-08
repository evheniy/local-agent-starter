# MCP

MCP, the Model Context Protocol, is a way to expose tools and resources to an
agent in a structured way.

Potential uses in this project:

- Read local project resources.
- Expose document indexes.
- Call local tools through a controlled interface.
- Connect the agent to external systems without hard-coding each integration in
  the main app.

This repository includes a Vyriy-based Streamable HTTP MCP server in
`workspaces/mcp`. It keeps HTTP routing and transport startup in the workspace
and registers tools from `packages/mcp`.

Run it locally with:

```bash
yarn dev:mcp
```

Available MCP tools:

- `ping` - checks that the MCP server is alive.
- `list_documents` - lists uploaded local documents with indexing status and
  chunk counts.
- `search_documents` - searches indexed local documents and returns matching
  chunks with scores and source metadata.
- `ask_documents` - asks a non-streaming RAG question over indexed local
  documents and returns compact sources.

The document tools are read-only. They reuse shared services for Postgres
access, retrieval, embeddings, and RAG chat instead of duplicating SQL or prompt
logic inside MCP handlers.
