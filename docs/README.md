# Documentation

Local Agent Starter is a small, inspectable local RAG application: upload a
text-like file, index it with a local embedding model, retrieve relevant
chunks from pgvector, and stream a grounded answer from a local chat model.

## Run the demo

Read these in order:

1. [Configure LM Studio](lm-studio.md).
2. Follow the [Docker quick start](../README.md#five-minute-docker-quick-start).
3. Run the reproducible [demo](demo.md).

Use [troubleshooting](troubleshooting.md) if a model, container, indexing job,
or stream does not behave as expected.

## Understand the system

1. Learn the beginner-friendly [concepts](concepts.md).
2. Follow the runtime flow in [architecture](architecture.md).
3. Inspect persistence and retrieval in [pgvector](pgvector.md).
4. Connect an external client through [MCP](mcp.md).

## Reference

- [Architecture](architecture.md) — services, data flow, and boundaries.
- [Concepts](concepts.md) — the vocabulary used by the project.
- [LM Studio](lm-studio.md) — local chat and embedding model setup.
- [pgvector](pgvector.md) — schema, indexing, and cosine retrieval.
- [MCP](mcp.md) — the read-only Streamable HTTP tool server.
- [Demo](demo.md) — repeatable browser walkthrough and screenshots.
- [Troubleshooting](troubleshooting.md) — diagnosis, logs, restarts, and resets.
