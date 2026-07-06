import type { z } from 'zod';

export type ToolResult = {
  content: Array<{
    type: 'text';
    text: string;
  }>;
};

export type ToolDefinition<Input extends z.ZodRawShape> = {
  name: string;
  description: string;
  inputSchema: Input;
  handler: (input: z.infer<z.ZodObject<Input>>) => ToolResult | Promise<ToolResult>;
};
