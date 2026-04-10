# GM System (Role-Based Access Control)

Role-based access control system for administrative commands, invincibility, and invisibility.

## Roles

Roles are defined in `src/core/enum/AccountRoleEnum.ts`:

| Role | DB Value | Description |
|------|----------|-------------|
| `PLAYER` | `PLAYER` | Regular player, no access to GM commands |
| `MODERATOR` | `MODERATOR` | Moderator, access to GM commands |
| `GAME_MASTER` | `GAME_MASTER` | Game Master, full access to GM commands |

The role is stored in the `auth.account` table in the `role` column (VARCHAR, defaults to `PLAYER`).

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

Commands marked as `gmOnly` in `src/game/domain/command/Commands.ts` are only available to `GAME_MASTER` and `MODERATOR` roles. The method `player.hasStaffRole()` checks whether the role is not `PLAYER`.

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
- Check: `player.isInvincible()`

## Invisibility (`/invisibility`)

Toggle - enables/disables invisibility. Uses the affect flags system (`AffectBitsTypeEnum.INVISIBILITY`).

- After toggling, calls `player.updateView()` to update visibility for nearby players
- Not persisted to database - resets on re-login

## Name Color System

A core system for controlling the color of player names displayed in the client. Colors are defined in `src/core/enum/NameColorEnum.ts` and mapped to client-side prefixes that the TMP4 client interprets for rendering.

### Available Colors

| Color | Prefix | Client behavior |
|-------|--------|-----------------|
| `DEFAULT` | *(none)* | Normal name color (empire-based) |
| `GOLDEN` | `[GM]` | Golden/yellow name |
| `RED` | `[PK]` | Red name |
| `BLUE` | `[BL]` | Blue name |
| `GREEN` | `[GR]` | Green name |
| `PURPLE` | `[PP]` | Purple name |
| `WHITE` | *(none)* | White name |

### How It Works

1. Each player has a `nameColor` field (`NameColorEnum`, defaults to `DEFAULT`)
2. `Player.getName()` reads the color and prepends the corresponding prefix from `getNameColorPrefix()`
3. The TMP4 client recognizes the prefix and renders the name in the matching color
4. The raw name (`this.name`) is used for database persistence (`toState()`) - no prefix stored in DB

### Default Colors by Role

When `Player.setRole()` is called, the name color is automatically set:

| Role | Default Color |
|------|---------------|
| `GAME_MASTER` | `GOLDEN` |
| `MODERATOR` | `BLUE` |
| `PLAYER` | `DEFAULT` |

### Changing Name Color (`/namecolor`)

GMs can override the name color for any player at runtime:

```
/namecolor golden           -- set your own name to golden
/namecolor red PlayerName   -- set PlayerName's name to red
/namecolor default Player   -- reset to default
```

After changing, `player.updateName()` re-sends `CharacterInfoPacket` to all nearby players so the change is visible immediately.

### Adding a New Color

1. Add the color to `NameColorEnum` in `src/core/enum/NameColorEnum.ts`
2. Add its client prefix to the `NAME_COLOR_PREFIX` map in the same file
3. The color is automatically available in `/namecolor`

## Adding a New GM Command

1. Create a folder in `src/game/domain/command/command/<name>/`
2. Create `<Name>Command.ts` (extends `Command`) and `<Name>CommandHandler.ts` (extends `CommandHandler`)
3. Register in `src/game/domain/command/Commands.ts` with `gmOnly: true`

## Source Files

- Role enum: `src/core/enum/AccountRoleEnum.ts`
- Name color enum + prefix map: `src/core/enum/NameColorEnum.ts`
- Command registration: `src/game/domain/command/Commands.ts`
- Permission checks: `src/game/app/command/CommandManager.ts`
- Immortal command: `src/game/domain/command/command/immortal/`
- Invisibility command: `src/game/domain/command/command/invisibility/`
- Name color command: `src/game/domain/command/command/namecolor/`
- Invincibility logic: `src/core/domain/entities/game/player/Player.ts` (`takeDamage`)
- Name display logic: `src/core/domain/entities/game/player/Player.ts` (`getName`, `updateName`)
