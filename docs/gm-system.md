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

## Display Name & Golden Nick

`Player.getName()` is overridden to prepend a role prefix to the player's name. The TMP4 client recognizes the `[GM]` prefix and automatically renders the name in gold.

| Role | Prefix | Client behavior |
|------|--------|-----------------|
| `GAME_MASTER` | `[GM]` | Golden name color |
| `MODERATOR` | `[MOD]` | Golden name color |
| `PLAYER` | *(none)* | Normal name color |

- The prefix is only added in `getName()` (used for packets sent to the client)
- The raw name (`this.name`) is used for database persistence (`toState()`)
- No changes needed on the client side - the TMP4 client handles the prefix natively

## Adding a New GM Command

1. Create a folder in `src/game/domain/command/command/<name>/`
2. Create `<Name>Command.ts` (extends `Command`) and `<Name>CommandHandler.ts` (extends `CommandHandler`)
3. Register in `src/game/domain/command/Commands.ts` with `gmOnly: true`

## Source Files

- Role enum: `src/core/enum/AccountRoleEnum.ts`
- Command registration: `src/game/domain/command/Commands.ts`
- Permission checks: `src/game/app/command/CommandManager.ts`
- Immortal command: `src/game/domain/command/command/immortal/`
- Invisibility command: `src/game/domain/command/command/invisibility/`
- Invincibility logic: `src/core/domain/entities/game/player/Player.ts` (`takeDamage`)
