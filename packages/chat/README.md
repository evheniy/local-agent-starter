# Chat

Small chat runtime package for the local agent starter.

## Exports

- `createChatResponse(request)` creates the current placeholder response text.
- `runChat(request)` yields chat stream events for the workspace transport.
- `ChatRequest`, `ChatMessage`, and `ChatStreamEvent` describe the runtime contract.

## Behavior

The package owns chat-domain behavior and does not know about HTTP, Docker, SSE,
or browser rendering.

Current behavior is intentionally simple:

- direct `message` input wins when present
- otherwise the last `user` message is used
- otherwise the default message is used
- `runChat()` yields `thinking`, `delta`, and `final` events

The workspace decides how to deliver those events.

## Usage

```ts
import { runChat } from '@p/chat';

for await (const event of runChat({ message: 'ping' })) {
  console.log(event);
}
```

## Validation

```bash
yarn test:jest packages/chat
```

Coverage must remain at 100% under the shared Jest config.
