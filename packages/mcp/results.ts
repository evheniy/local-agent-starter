import type { ToolResult } from './types.js';

export const jsonToolResult = (body: unknown): ToolResult => ({
  content: [
    {
      type: 'text',
      text: JSON.stringify(body),
    },
  ],
});
