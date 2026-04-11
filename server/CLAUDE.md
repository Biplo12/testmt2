# Project Rules

## Documentation
- Always write documentation in `docs/` for every new system or feature (in English)

## Quality Checks
- After every iteration, run type checking (`bun run build`) and unit tests (`bun run test:unit`)
- Fix any type errors before moving on
- Pre-existing test failures (e.g. missing `questManager` in `PlayerFactory.test.ts`) are known and not blockers

## Tech Stack
- TypeScript, Bun runtime
- Mocha for tests (`bun run test:unit`)
- Redis for caching
- Custom packet-based networking (Metin2 protocol)

## Monorepo Structure
- `server/` — TypeScript game server
- `client/pack/root/` — Python client source files (.py)
- `client/Eternexus/uiscript/` — UI script files
- `client/repack.js` — pack tool (not working with encrypted packs, use EterNexus GUI)

## Client Changes Workflow

### Dev Mode (recommended for development)
1. Ensure `client/dev_mode` file exists (contains `pack/root`)
2. Edit Python files in `client/pack/root/`
3. In-game: open console (`~`), type `r moduleName` to reload
- No packing needed — `system.py` reads loose .py files from disk
- Console commands: `r <module>` (reload one), `ra` (reload recent), `rui` (reload all UI)
- After `rui`, close/reopen windows to apply changes
- `system.py` and `consolemodule.py` changes still require repacking (see below)

### Full Repack (when dev mode files change, or for release)
1. Edit Python files in `client/pack/root/`
2. Open `client/Eternexus/EterNexus.exe`
3. File → Pack Archive → select `client/pack/root`
4. Restart client

### Notes
- `serverinfo.py` must have correct SERVER_IP/ports after repacking
- `transparent.tga` in pack/root/ is used to hide envelope button for GM whisper
- `client/watch-and-pack.js` — optional auto-pack watcher (`node watch-and-pack.js`)
- To disable dev mode: delete `client/dev_mode` file
