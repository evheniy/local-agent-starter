import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';

import { useChatPanelState } from './use-chat-panel-state.js';

describe('useChatPanelState', () => {
  it('keeps question input and submits non-empty questions', () => {
    const { result } = renderHook(() => useChatPanelState());

    act(() => {
      result.current.setQuestion('  What is indexed?  ');
    });

    expect(result.current.canSubmit).toBe(true);

    act(() => {
      result.current.submitQuestion();
    });

    expect(result.current.answer).toBe('Queued local question: What is indexed?');
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('does not submit empty questions', () => {
    const { result } = renderHook(() => useChatPanelState());

    act(() => {
      result.current.setQuestion('   ');
    });

    expect(result.current.canSubmit).toBe(false);

    act(() => {
      result.current.submitQuestion();
    });

    expect(result.current.answer).toBe('This placeholder answer will later be streamed from the local chat service.');
  });
});
