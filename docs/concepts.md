# Concepts

## Agent

An agent is not just a chat model. In this project, an agent is a small application loop that can:

- receive a user question
- retrieve knowledge
- call tools
- build context
- ask the LLM for an answer
- stream the result back to the UI

In AWS Bedrock terms, this is similar to how a Bedrock Agent can use a Knowledge Base and Action Groups.

In this project:

- the LLM runtime is external
- the knowledge layer is local
- the tools are explicit
- the UI shows the pipeline

## LLM

The LLM is the model that generates the final answer.

Examples:

- Qwen
- Llama
- Mistral
- DeepSeek Coder

In this project, the LLM is configured with:

```env
LLM_PROVIDER=lmstudio
LLM_BASE_URL=http://host.docker.internal:1234/v1
LLM_MODEL=qwen3-coder
```

## UI Modes

The UI has two modes:

1. Chat - ask questions and observe the visible application pipeline.
2. Upload - select local files that will later be sent to the ingest/indexing API.

The trace panel shows application-level steps, not hidden model thoughts.
