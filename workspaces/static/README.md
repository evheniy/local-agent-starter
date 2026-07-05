# Static

Static asset workspace for the profile-card UI. It is served with `vs`, the CLI provided by `@vyriy/static`.

## Assets

- `avatar.svg` is the default demo avatar.

## Local Development

From the repository root:

```bash
yarn start:static
```

The script sources `workspaces/env.sh` and runs:

```bash
npx vs -p $CDN_PORT workspaces/static/public
```

This serves every file in `workspaces/static/public` as a directly addressable static asset for the project.

Default local values:

- `CDN_PORT=3001`
- `CDN=http://localhost:3001`

The API and UI demo use the avatar at:

```text
http://localhost:3001/avatar.svg
```

## Global CLI

`@vyriy/static` can be installed globally when you want the `vs` command available without `npx` or project scripts:

```bash
npm install --global @vyriy/static
vs -p 3001 workspaces/static/public
```

Use the same command shape for any static directory:

```bash
vs -p <port> <static-directory>
```

## Build

```bash
yarn build:static
```

The build copies files from `workspaces/static/public` into `dist/cdn`.

## Notes

- Keep files in `public` directly addressable by URL.
- Add shared static demo assets here rather than coupling them to the API or UI workspace.
