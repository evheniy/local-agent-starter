# Chat Workspace

Streaming chat HTTP workspace for the local agent starter.

## Behavior

The workspace starts an `@vyriy/server` streaming handler and exposes:

- `POST /chat` as `text/event-stream`
- `POST /chat/stream` as RAG `text/event-stream`
- `GET /healthcheck` with service metadata

The `/chat` route accepts either a JSON string or a JSON object compatible with
`ChatRequest` from `@p/chat`.

The `/chat/stream` route accepts:

```json
{
  "message": "What does this document say?",
  "limit": 5
}
```

It retrieves indexed document chunks, sends sources first, streams LLM answer
deltas, and finishes with a done event.

Example response stream:

```txt
event: thinking
data: {"type":"thinking","text":"Preparing chat response..."}

event: delta
data: {"type":"delta","text":"Echo:"}

event: final
data: {"type":"final","text":"Echo: ping"}
```

Example RAG stream:

```txt
event: sources
data: {"sources":[]}

event: answer_delta
data: {"text":"partial answer"}

event: done
data: {"ok":true}
```

Manual RAG stream test:

```bash
curl -N \
  -H "content-type: application/json" \
  -H "accept: text/event-stream" \
  -X POST "http://localhost:3002/chat/stream" \
  -d '{"message":"What does this document say?","limit":5}'
```

## Local Development

From the repository root:

```bash
yarn dev:chat
```

Default local values:

- `CHAT_PORT=3002`
- `CHAT=http://localhost:3002`

The RAG stream also uses Postgres, `EMBEDDING_BASE_URL`, `EMBEDDING_MODEL`,
`LLM_BASE_URL`, and `LLM_MODEL`.

## Build

```bash
yarn build:chat
```

The build emits the server bundle to `dist/chat/index.js` and copies the
workspace `package.json` into `dist/chat`.

## Docker

The Dockerfile is runtime-only. Build the workspace first:

```bash
yarn build:chat
```

Then build the image from the generated workspace output:

```bash
docker build -f workspaces/chat/Dockerfile dist/chat
```

Docker Compose exposes the service on `${CHAT_PORT}:3000`.

## Validation

```bash
yarn test:jest workspaces/chat
```

The tests verify stream server startup, SSE output, RAG stream validation,
healthcheck behavior, and fallback responses.
