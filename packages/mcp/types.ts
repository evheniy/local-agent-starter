import type { z } from 'zod';
import type { ListUploadedFilesType, RagChatType, RetrieveRelevantChunksType } from '@p/services';

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

export type CreateAskDocumentsToolOptions = {
  ragChat?: RagChatType;
};

export type CreateListDocumentsToolOptions = {
  listUploadedFiles?: ListUploadedFilesType;
};

export type CreateSearchDocumentsToolOptions = {
  retrieveRelevantChunks?: RetrieveRelevantChunksType;
};
