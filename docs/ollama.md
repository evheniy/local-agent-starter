# Ollama

Ollama is another local model runtime option for chat and embeddings.

Typical local base URL:

```text
http://localhost:11434
```

When accessed from Docker containers, use:

```text
http://host.docker.internal:11434
```

Keep Ollama-specific model names in `.env` and document reusable defaults in
`.env.example`.
