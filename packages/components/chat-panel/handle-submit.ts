import type { HandleSubmitType } from './types.js';

export const handleSubmit: HandleSubmitType = (onSubmit, { canSubmit, isLoading }) => {
  return (event) => {
    event.preventDefault();

    if (canSubmit && !isLoading) {
      void onSubmit?.();
    }
  };
};
