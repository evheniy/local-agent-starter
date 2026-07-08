# MCP

MCP runtime package for the local agent starter.

## Exports

- `createMcpServer()` creates the local MCP server and registers tools.
- `pingTool` is the first MCP tool and returns `pong`.
- `listDocumentsTool` lists uploaded local documents.
- `searchDocumentsTool` searches indexed local documents through the shared
  retrieval service.
- `askDocumentsTool` asks over indexed local documents through the shared RAG
  chat service.
- `ToolDefinition` and `ToolResult` describe the small internal tool contract.

## Behavior

The package owns MCP tool registration and tool behavior. It does not own HTTP
transport concerns; those live in `workspaces/mcp`.

Current registered tools:

- `ping` - checks that the local MCP server is alive
- `list_documents` - lists uploaded documents with indexing status and chunk
  counts
- `search_documents` - searches indexed documents and returns matching chunks
- `ask_documents` - asks a non-streaming RAG question and returns compact
  sources

## Usage

```ts
import { createMcpServer } from '@p/mcp';

const server = createMcpServer();
```

## Validation

```bash
yarn test:jest packages/mcp
```

Coverage must remain at 100% under the shared Jest config.
