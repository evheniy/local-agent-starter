import { describe, expect, it, jest } from '@jest/globals';
import { isValidElement } from 'react';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';

const elementMock = jest.fn();
const mockSetFile = jest.fn();
const mockSetQuestion = jest.fn();
const mockSetTab = jest.fn();
const mockSubmitQuestion = jest.fn();
const mockUploadFile = jest.fn();
const mockAgentShell = jest.fn((props: unknown, context?: unknown) => {
  void props;
  void context;

  return <section>Rendered Agent Shell</section>;
});

jest.mock('@vyriy/render/element', () => ({
  element: elementMock,
}));

jest.mock('@p/components/agent-shell', () => ({
  AgentShell: mockAgentShell,
}));

jest.mock('./hooks/index.js', () => ({
  useAgentShellTab: () => ({
    setTab: mockSetTab,
    tab: 'chat',
  }),
  useChatPanelState: () => ({
    answer: 'answer',
    canSubmit: true,
    error: undefined,
    hasIndexedFiles: true,
    isLoading: false,
    messages: [],
    question: 'question',
    onQuestionChange: mockSetQuestion,
    onSubmit: mockSubmitQuestion,
  }),
  useFileUploadState: () => ({
    error: undefined,
    file: undefined,
    files: [],
    isRefreshing: false,
    setFile: mockSetFile,
    status: 'idle',
    syncFiles: jest.fn(),
    uploadFile: mockUploadFile,
  }),
}));

describe('workspaces/ui/index.tsx', () => {
  const loadEntry = async () => {
    const root = document.createElement('div');
    root.id = 'root';
    elementMock.mockClear();
    document.body.replaceChildren();
    document.body.append(root);

    await jest.isolateModulesAsync(async () => {
      await import('./index.js');
    });

    const [{ component }] = elementMock.mock.calls[0] as [{ component: ReactElement }];

    return {
      root,
      component,
    };
  };

  it('mounts the UI into the root element', async () => {
    const { root, component } = await loadEntry();

    expect(elementMock).toHaveBeenCalledTimes(1);
    expect(elementMock).toHaveBeenCalledWith({
      root,
      component,
    });
  });

  it('renders the local agent shell component', async () => {
    const { component } = await loadEntry();

    expect(isValidElement(component)).toBe(true);
    expect(typeof component.type).toBe('function');
    expect((component.type as { name?: string }).name).toBe('LocalAgentApp');
    expect(component.props).toEqual({});
  });

  it('renders the local agent app', async () => {
    const { component } = await loadEntry();

    render(component);

    expect(screen.getByText('Rendered Agent Shell')).toBeDefined();
    expect(mockAgentShell).toHaveBeenCalledWith(
      {
        tab: 'chat',
        chatPanel: {
          answer: 'answer',
          canSubmit: true,
          error: undefined,
          hasIndexedFiles: true,
          isLoading: false,
          messages: [],
          question: 'question',
          onQuestionChange: mockSetQuestion,
          onSubmit: mockSubmitQuestion,
        },
        files: [],
        filesPanel: {
          isRefreshing: false,
          onRefresh: expect.any(Function),
        },
        traceEvents: [],
        uploadPanel: {
          error: undefined,
          file: undefined,
          status: 'idle',
          onFileChange: mockSetFile,
          onUpload: mockUploadFile,
        },
        onTabChange: mockSetTab,
      },
      undefined,
    );
  });
});
