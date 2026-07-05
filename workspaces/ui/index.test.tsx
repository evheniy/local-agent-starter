import { describe, expect, it, jest } from '@jest/globals';
import { isValidElement } from 'react';
import type { ReactElement } from 'react';

const elementMock = jest.fn();

jest.mock('@vyriy/render/element', () => ({
  element: elementMock,
}));

describe('workspaces/ui/index.tsx', () => {
  const loadEntry = async () => {
    const root = document.createElement('div');
    root.id = 'root';
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
    expect((component.type as { name?: string }).name).toBe('AgentShell');
    expect(component.props).toEqual({});
  });
});
