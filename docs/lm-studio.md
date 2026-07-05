# LM Studio

LM Studio can provide local OpenAI-compatible endpoints for chat and
embeddings.

Current environment variables:

- `LLM_PROVIDER=lmstudio`
- `LLM_BASE_URL=http://host.docker.internal:1234/v1`
- `LLM_MODEL=qwen2.5-coder-7b-instruct`
- `EMBEDDING_PROVIDER=lmstudio`
- `EMBEDDING_BASE_URL=http://host.docker.internal:11434`
- `EMBEDDING_MODEL=text-embedding-qwen3-embedding-0.6b`

When the API runs in Docker, `host.docker.internal` points from the container
back to services running on the host machine.
