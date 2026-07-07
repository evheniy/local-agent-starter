import { describe, expect, it, jest } from '@jest/globals';

import { handleSubmit } from './handle-submit.js';

type SubmitEvent = Parameters<ReturnType<typeof handleSubmit>>[0];

const createSubmitEvent = () => {
  const preventDefault = jest.fn();
  const event = { preventDefault } as unknown as SubmitEvent;

  return { event, preventDefault };
};

describe('handleSubmit', () => {
  it('prevents the native submit and calls onSubmit when submitting is allowed', () => {
    const { event, preventDefault } = createSubmitEvent();
    const onSubmit = jest.fn<() => void>();

    handleSubmit(onSubmit, { canSubmit: true, isLoading: false })(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not call onSubmit when submitting is disabled', () => {
    const { event, preventDefault } = createSubmitEvent();
    const onSubmit = jest.fn<() => void>();

    handleSubmit(onSubmit, { canSubmit: false, isLoading: false })(event);
    handleSubmit(onSubmit, { canSubmit: true, isLoading: true })(event);

    expect(preventDefault).toHaveBeenCalledTimes(2);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('allows a missing onSubmit callback', () => {
    const { event, preventDefault } = createSubmitEvent();

    handleSubmit(undefined, { canSubmit: true, isLoading: false })(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
