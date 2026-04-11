# Client Dev Mode

Dev mode allows editing client Python files without repacking or restarting the client. Changes are loaded directly from disk and can be applied at runtime via console commands.

## Setup

1. **One-time pack**: After modifying `system.py` and `consolemodule.py`, pack them once:
   - Open `client/Eternexus/EterNexus.exe`
   - File -> Pack Archive -> select `client/pack/root`
   - Restart client

2. **Create flag file**: The file `client/dev_mode` must exist. It contains the path to loose .py files (default: `pack/root`).

3. **Verify**: After starting the client, check `syserr.txt` for `DEV MODE enabled, root: pack/root`.

## Usage

### Editing files
Edit .py files directly in `client/pack/root/`. No packing needed.

### Reloading in-game
Open the console (`~` key) and use these commands:

| Command | Description |
|---------|-------------|
| `r <module>` | Reload a specific module (e.g., `r uiInventory`) |
| `ra` | Reload all modules modified in the last 60 seconds |
| `rui` | Reload all UI modules and reset window state |
| `reload_locale` | Reload locale/translation data |
| `re` | Reload uiGuild and uiInventory (legacy command) |

### After reloading UI modules
After `rui`, the `isLoaded` flags on windows are reset. Close and reopen each window (e.g., close inventory with `I`, then reopen) to see changes.

## How it works

### system.py modifications

Dev mode modifies the Python-level file loading in `system.py`:

1. **`_dev_read_file()`** — Reads a file from disk (`pack/root/`) if it exists, returns `None` otherwise.

2. **`pack_file.__init__()`** — Checks disk first via `_dev_read_file()`, falls back to `pack.Get()`. This covers all `pack_open()` / `execfile()` calls, including UI script loading.

3. **`__pack_import()`** — Checks disk first for Python imports, falls back to pack. On syntax errors, logs the error and falls through to the pack version.

4. **`reload()` override** — Python 2.7's built-in `reload()` uses `imp.find_module()` which doesn't know about pack files. The override deletes the module from `sys.modules` and re-imports through `__pack_import`, which reads from disk.

### Console commands (consolemodule.py)

Three new commands registered in `ConsoleWindow.InitFunction()`:
- `r` -> `Console.ReloadModule(name)` — Calls `reload()` on a named module
- `ra` -> `Console.ReloadRecent()` — Finds modules with .py files modified < 60s ago, reloads them
- `rui` -> `Console.ReloadUI()` — Reloads a predefined list of UI modules, resets `isLoaded` flags

## Limitations

| Limitation | Explanation |
|------------|-------------|
| `system.py` requires repack | Loaded by C++ engine before Python dev mode activates |
| `consolemodule.py` requires repack | Same as above (loaded early in bootstrap) |
| Existing instances not updated | `reload()` creates new class definitions but existing window instances keep old methods. Close/reopen windows after reload. |
| Structural changes may need restart | New classes, changed inheritance, or new module-level globals may not work with simple reload |
| UIScript files need correct path | Must be at `pack/root/UIScript/filename.py` to be picked up by dev mode |

## Disabling dev mode

Delete the `client/dev_mode` file. The client will revert to loading everything from the packed `.epk` file.

## Auto-pack watcher (optional)

For cases where packing IS needed (e.g., `system.py` changes):

```
cd client
node watch-and-pack.js
```

This watches `pack/root/` for changes and auto-runs EterNexus CLI to repack. Uses chokidar if available, falls back to `fs.watch`.
