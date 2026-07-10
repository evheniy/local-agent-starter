# Concepts

This page explains the terms used by Local Agent Starter without assuming prior
AI or search experience.

## Agent

An **agent** is an application that combines a model with context, tools, and a
workflow. Here, the application accepts a question, retrieves local knowledge,
builds a grounded prompt, asks an LLM for an answer, and streams the result. It
is deliberately a small explicit pipeline, not a general-purpose agent
framework.

## LLM

A **large language model (LLM)** generates text from a prompt. The configured
chat model writes the final answer. It is separate from the embedding model.

## Embedding, vector, and similarity search

An **embedding** is a numeric representation of text produced by an embedding
model. The resulting array of numbers is a **vector**. Texts with similar
meaning tend to have vectors that are close under a chosen distance measure.

**Similarity search** compares a question vector with stored chunk vectors. In
this project, pgvector uses cosine distance and returns the closest chunks.

## Chunk

A **chunk** is a smaller, ordered piece of a document. Splitting a long file
lets retrieval select focused passages instead of placing every uploaded file
in every prompt.

## Retrieval and RAG

**Retrieval** finds chunks relevant to the user's question. **Retrieval-
augmented generation (RAG)** adds those chunks to the LLM prompt before asking
for an answer:

```text
question → embed → retrieve chunks → build grounded prompt → generate answer
```

A **source** identifies the document and chunk used as context. Sources make
the result inspectable; they support **grounding**, meaning the answer is based
on retrieved material rather than only the model's pretrained knowledge. A
source is evidence to inspect, not a guarantee that every generated statement
is correct.

## Streaming

**Streaming** sends an answer incrementally. The chat service uses Server-Sent
Events (SSE), first sending retrieved sources and then answer deltas until a
final `done` event. It can send an `error` event if generation fails after the
stream has opened.

## Tool and MCP

A **tool** is a named operation with structured input and output that a client
can invoke. **Model Context Protocol (MCP)** standardizes how clients discover
and call such tools. This project exposes read-only tools for listing,
searching, and asking questions over local documents.

## Background worker and indexing job

A **background worker** performs work outside the upload request. Uploading
creates an **indexing job** in Postgres. The indexer claims a queued job, reads
the file, chunks and embeds it, writes the document and chunks, and records
success or failure. The browser can remain responsive while this happens.

## Application trace and chain of thought

The trace panel shows visible **application-level pipeline events**, such as a
request being accepted, retrieval running, and generation completing. It does
not expose hidden model reasoning or chain of thought. Treat it as operational
progress for this application's explicit stages.
