import { describe, expect, it, jest } from '@jest/globals';
import type { HandlerParams } from '@vyriy/router';

jest.mock('@p/env', () => ({
  getUi: () => 'http://localhost:3002',
}));

describe('html handler', () => {
  const params = {
    event: {
      body: null,
      headers: {},
      httpMethod: 'GET',
      path: '/',
      pathParameters: null,
      queryStringParameters: null,
    },
  } as HandlerParams;

  const loadHtml = async () => {
    const { html } = await import('./html.js');

    return html;
  };

  it('renders the local agent document', async () => {
    const html = await loadHtml();
    const response = await html(params);

    expect(response.body).toContain('<html lang="en">');
    expect(response.body).toContain('<title>Local Agent Starter</title>');
    expect(response.body).toContain('<meta charset="utf-8"');
    expect(response.body).toContain('name="viewport"');
    expect(response.body).toContain('href="http://localhost:3002/main.css"');
    expect(response.body).toContain('<div id="root" rendered>');
    expect(response.body).toContain('Local Agent Starter');
    expect(response.body).toContain('Documents');
    expect(response.body).toContain('No documents yet. Upload a file to start local RAG.');
    expect(response.body).toMatch(/src\s*=\s*"http:\/\/localhost:3002\/index\.js"/);
  });

  it('sets browser-safe html response headers', async () => {
    const html = await loadHtml();
    const response = await html(params);

    expect(response).toMatchObject({
      headers: {
        'access-control-allow-origin': '*',
        'content-type': 'text/html; charset=utf-8',
        'x-content-type-options': 'nosniff',
      },
    });
  });
});
