# UI Package

Browser-side API helpers for the local agent UI.

## Behavior

The package exposes small client helpers for the UI workspace:

- `streamChat` posts to `/chat/stream` and reads Server-Sent Events.
- `streamChat` falls back to the JSON `/chat` endpoint when streaming is not
  available.
- `listFiles` reads uploaded file metadata from `/files`.
- `uploadFile` uploads a raw file body to `/upload?filename=...`.

Base URLs come from browser-injected environment values:

- `CHAT` for streaming chat.
- `API` for API requests and as the chat fallback base URL.
- `window.location.origin` when no explicit base URL is configured.

## Files

Each behavior lives in a focused file with a matching test:

- `get-api-base-url.ts`
- `get-chat-base-url.ts`
- `parse-event-block.ts`
- `dispatch-stream-event.ts`
- `process-buffered-events.ts`
- `stream-chat-response.ts`
- `request-json-chat.ts`
- `should-fallback-to-json-chat.ts`
- `stream-chat.ts`
- `list-files.ts`
- `get-upload-error-message.ts`
- `upload-file.ts`

Shared request and response types live in `types.ts`.

## Usage

```ts
import { listFiles, streamChat, uploadFile } from '@p/ui';
```

## Validation

```bash
yarn test:jest packages/ui
```
