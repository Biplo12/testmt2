# GM System (Role-Based Access Control)

Role-based access control system for administrative commands, invincibility, invisibility, and visual identity.

## Roles

Roles are defined in `src/core/enum/AccountRoleEnum.ts`:

| Role | DB Value | Description |
|------|----------|-------------|
| `PLAYER` | `PLAYER` | Regular player, no access to GM commands |
| `MODERATOR` | `MODERATOR` | Moderator, access to staff commands |
| `GAME_MASTER` | `GAME_MASTER` | Game Master, full access to staff commands |

The role is stored in the `auth.account` table in the `role` column (VARCHAR, defaults to `PLAYER`).

### Role Configuration

Each role is configured via `ROLE_CONFIG` in `AccountRoleEnum.ts`:

```typescript
{ tag: '[GM]', color: NameColorEnum.RED, staff: true }
```

- `tag` - prefix displayed before the player name (e.g. `[GM]`)
- `color` - name color from `NameColorEnum` (rendered via hex color codes)
- `staff` - whether this role has access to staff commands

### Staff Role Detection

`isStaffRole(role)` checks the `staff` flag in `ROLE_CONFIG`. Only roles explicitly marked as `staff: true` are treated as staff. Unknown or new roles default to no staff access.

### Adding a New Role

1. Add the value to `AccountRoleEnum`
2. Add a `ROLE_CONFIG` entry with `tag`, `color`, and `staff` flag

## Data Flow

```
auth.account (role)
  -> LoginService (stores role in cache token)
    -> AuthenticateService (reads from cache)
      -> GameConnection (holds role for the session)
        -> Player (setRole on character select)
```

## Assigning Roles

### Via SQL (directly in the database)

```sql
-- Grant Game Master role
UPDATE auth.account SET role = 'GAME_MASTER' WHERE username = 'admin';

-- Grant Moderator role
UPDATE auth.account SET role = 'MODERATOR' WHERE username = 'moderator1';

-- Revoke back to regular player
UPDATE auth.account SET role = 'PLAYER' WHERE username = 'admin';
```

The player must re-login after a role change.

### Default Accounts (after migration)

| Account | Role |
|---------|------|
| `admin` | `GAME_MASTER` |
| `admin1` | `PLAYER` |

## GM Commands

Commands marked as `gmOnly` in `src/game/domain/command/Commands.ts` are only available to staff roles. The method `player.hasStaffRole()` delegates to `isStaffRole()`.

### Staff-only Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/exp` | Add experience | `/exp 1000` |
| `/gold` | Add gold | `/gold 50000` |
| `/goto` | Teleport | `/goto map_a2` |
| `/invoke` | Spawn a mob | `/invoke 101 5` |
| `/item` | Create an item | `/item 19 1` |
| `/lvl` | Set level | `/lvl 50` |
| `/stat` | Add stat points | `/stat ht 90` |
| `/list` | List resources | `/list areas` |
| `/priv` | Add privileges | `/priv empire blue exp 100 1000` |
| `/immortal` | Toggle invincibility | `/immortal` |
| `/invisibility` | Toggle invisibility | `/invisibility` |
| `/namecolor` | Change name color | `/namecolor golden [target]` |

### Commands Available to Everyone

| Command | Description |
|---------|-------------|
| `/help` | List available commands (filtered by role) |
| `/logout` | Log out character |
| `/quit` | Close the client |
| `/restartHere` | Respawn at death location |
| `/restartTown` | Respawn in town |
| `/select` | Character select |

## Invincibility (`/immortal`)

Toggle - enables/disables invincibility. When enabled, `Player.takeDamage()` ignores all damage.

- State stored in `Player.invincible` field (boolean, defaults to `false`)
- Not persisted to database - resets on re-login

## Invisibility (`/invisibility`)

Toggle - enables/disables invisibility. Uses the affect flags system (`AffectBitsTypeEnum.INVISIBILITY`).

- After toggling, calls `player.updateView()` to update visibility for nearby players
- Not persisted to database - resets on re-login

## Visual Identity

Staff players are visually distinguished through three mechanisms:

### 1. Colored Name Prefix

`Player.getName()` prepends a role tag colored with the Metin2 `|cFFRRGGBB` color code format. The color and tag are defined in `ROLE_CONFIG`:

| Role | Tag | Color | Displayed as |
|------|-----|-------|-------------|
| `GAME_MASTER` | `[GM]` | Red (`FF0000`) | Red `[GM]PlayerName` |
| `MODERATOR` | `[MOD]` | Blue (`3296FF`) | Blue `[MOD]PlayerName` |
| `PLAYER` | *(none)* | *(none)* | `PlayerName` |

The prefix + color is visible in:
- Character select screen (sent via `AuthTokenPacketHandler`)
- Above the player's head in-game (via `Player.getName()`)
- The raw name (`this.name`) is used for database persistence - no prefix/color stored in DB

### 2. GM Indicator (YMIR Affect)

On spawn, staff players receive the `AffectBitsTypeEnum.YMIR` flag. The TMP4 client recognizes this and renders a GM indicator icon above the character.

### 3. Name Color Override (`/namecolor`)

GMs can override any player's name color at runtime. When a custom color is set that differs from the role default, it wraps the entire display name in the chosen color code.

## Name Color System

Colors are defined in `src/core/enum/NameColorEnum.ts` with hex values:

| Color | Hex | Example |
|-------|-----|---------|
| `DEFAULT` | *(none)* | Normal rendering |
| `RED` | `FF0000` | Red name |
| `BLUE` | `3296FF` | Blue name |
| `GREEN` | `00FF00` | Green name |
| `GOLDEN` | `FFD700` | Golden name |
| `PURPLE` | `AA00FF` | Purple name |
| `WHITE` | `FFFFFF` | White name |
| `ORANGE` | `FF8C00` | Orange name |
| `CYAN` | `00FFFF` | Cyan name |
| `PINK` | `FF69B4` | Pink name |

### Color Code Format

The TMP4 client supports inline color codes: `|cFFRRGGBB` where `RRGGBB` is a hex color. The helper functions:

- `colorize(text, NameColorEnum)` - wraps text with the enum's hex color
- `colorizeHex(text, hex)` - wraps text with a custom hex color

### Changing Name Color (`/namecolor`)

```
/namecolor golden           -- set your own name to golden
/namecolor red PlayerName   -- set PlayerName's name to red
/namecolor default Player   -- reset to role default
```

After changing, `player.updateName()` re-sends `CharacterInfoPacket` to all nearby players.

### Adding a New Color

1. Add the value to `NameColorEnum`
2. Add its hex to `NAME_COLOR_HEX` in the same file
3. The color is automatically available in `/namecolor`

## Adding a New GM Command

1. Create a folder in `src/game/domain/command/command/<name>/`
2. Create `<Name>Command.ts` (extends `Command`) and `<Name>CommandHandler.ts` (extends `CommandHandler`)
3. Register in `src/game/domain/command/Commands.ts` with `gmOnly: true`

## Source Files

- Role enum, config, staff detection: `src/core/enum/AccountRoleEnum.ts`
- Name color enum, hex map, colorize helpers: `src/core/enum/NameColorEnum.ts`
- Command registration: `src/game/domain/command/Commands.ts`
- Permission checks: `src/game/app/command/CommandManager.ts`
- Immortal command: `src/game/domain/command/command/immortal/`
- Invisibility command: `src/game/domain/command/command/invisibility/`
- Name color command: `src/game/domain/command/command/namecolor/`
- Invincibility logic: `src/core/domain/entities/game/player/Player.ts` (`takeDamage`)
- Visual identity: `src/core/domain/entities/game/player/Player.ts` (`getName`, `onSpawn`, `updateName`)
- Character select: `src/core/interface/networking/packets/packet/in/authToken/AuthTokenPacketHandler.ts`
