import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { AgentShell } from './agent-shell.js';

const traceEvents = [
  {
    id: 'question',
    title: 'Question received',
    description: 'The UI captured the current user question.',
    status: 'done' as const,
  },
  {
    id: 'retrieval',
    title: 'Retrieve context',
    description: 'Search will later retrieve chunks from indexed files.',
    status: 'running' as const,
    metadata: { provider: 'pgvector', chunks: 2 },
  },
  {
    id: 'answer',
    title: 'Generate response',
    description: 'The answer stream placeholder waits for API wiring.',
    status: 'pending' as const,
  },
];

const chunks = [
  {
    id: 'chunk-1',
    title: 'Project Concepts',
    path: 'docs/concepts.md',
    content: 'RAG retrieves project or document context before asking an LLM to answer.',
    score: 0.91,
  },
  {
    id: 'chunk-2',
    title: 'pgvector Notes',
    path: 'docs/pgvector.md',
    content: 'The embedding dimension must stay aligned with the embedding model.',
    score: 0.84,
  },
];

const files = [
  {
    id: 'file-1',
    name: 'concepts.md',
    size: 2048,
    type: 'text/markdown',
    status: 'indexed' as const,
    chunksCount: 6,
  },
  {
    id: 'file-2',
    name: 'architecture.md',
    size: 1536,
    type: 'text/markdown',
    status: 'uploaded' as const,
  },
];

const meta = {
  title: 'Components/AgentShell',
  component: AgentShell,
  parameters: { docs: { page: null } },
  args: {
    tab: 'chat',
    chatPanel: {
      answer: 'This placeholder answer will later be streamed from the local agent API.',
      question: 'What does this project already know about pgvector?',
    },
    chunks,
    files,
    traceEvents,
    uploadPanel: {},
  },
} satisfies Meta<typeof AgentShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Chat: Story = {};

export const Upload: Story = { args: { tab: 'upload' } };
