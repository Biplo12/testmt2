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

### Staff Role Detection

Staff roles are defined explicitly in `STAFF_ROLES` set in `AccountRoleEnum.ts`. The helper `isStaffRole(role)` checks membership against this set - only roles explicitly listed are treated as staff. Unknown or new roles default to no staff access.

### Adding a New Role

1. Add the value to `AccountRoleEnum`
2. If it should have staff access, add it to `STAFF_ROLES`
3. Optionally add a name prefix in `ROLE_NAME_PREFIX`

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

Commands marked as `gmOnly` in `src/game/domain/command/Commands.ts` are only available to staff roles. The method `player.hasStaffRole()` delegates to `isStaffRole()` which checks the `STAFF_ROLES` set.

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

## Visual Identity (Name Prefix & Golden Nick)

Staff players are visually distinguished through two mechanisms:

### 1. Name Prefix

`Player.getName()` prepends a role-based prefix using `ROLE_NAME_PREFIX` map from `AccountRoleEnum.ts`:

| Role | Prefix | Displayed as |
|------|--------|-------------|
| `GAME_MASTER` | `[GM]` | `[GM]PlayerName` |
| `MODERATOR` | `[MOD]` | `[MOD]PlayerName` |
| `PLAYER` | *(none)* | `PlayerName` |

The prefix is visible in:
- Character select screen (sent via `AuthTokenPacketHandler`)
- Above the player's head in-game (via `Player.getName()`)
- The raw name (`this.name`) is used for database persistence - no prefix stored in DB

### 2. Golden Name Color (YMIR Affect)

On spawn, staff players receive the `AffectBitsTypeEnum.YMIR` flag. This is the native Metin2 mechanism for GM identification - the TMP4 client recognizes it and renders:
- Golden/yellow name color above the head
- GM indicator icon

Set in `Player.onSpawn()` for all staff roles.

## Name Color System

A core system for controlling the color of player names. Colors are defined in `src/core/enum/NameColorEnum.ts`.

### Available Colors

`DEFAULT`, `GOLDEN`, `RED`, `BLUE`, `GREEN`, `PURPLE`, `WHITE`

### How It Works

1. Each player has a `nameColor` field (`NameColorEnum`, defaults to `DEFAULT`)
2. When `setRole()` is called, `nameColor` is automatically set (`GAME_MASTER` -> `GOLDEN`, `MODERATOR` -> `BLUE`)
3. GMs can override any player's color at runtime via `/namecolor`

### Changing Name Color (`/namecolor`)

```
/namecolor golden           -- set your own name to golden
/namecolor red PlayerName   -- set PlayerName's name to red
/namecolor default Player   -- reset to default
```

After changing, `player.updateName()` re-sends `CharacterInfoPacket` to all nearby players.

## Adding a New GM Command

1. Create a folder in `src/game/domain/command/command/<name>/`
2. Create `<Name>Command.ts` (extends `Command`) and `<Name>CommandHandler.ts` (extends `CommandHandler`)
3. Register in `src/game/domain/command/Commands.ts` with `gmOnly: true`

## Source Files

- Role enum, prefix map, staff detection: `src/core/enum/AccountRoleEnum.ts`
- Name color enum: `src/core/enum/NameColorEnum.ts`
- Command registration: `src/game/domain/command/Commands.ts`
- Permission checks: `src/game/app/command/CommandManager.ts`
- Immortal command: `src/game/domain/command/command/immortal/`
- Invisibility command: `src/game/domain/command/command/invisibility/`
- Name color command: `src/game/domain/command/command/namecolor/`
- Invincibility logic: `src/core/domain/entities/game/player/Player.ts` (`takeDamage`)
- Visual identity: `src/core/domain/entities/game/player/Player.ts` (`getName`, `onSpawn`, `updateName`)
- Character select prefixing: `src/core/interface/networking/packets/packet/in/authToken/AuthTokenPacketHandler.ts`
