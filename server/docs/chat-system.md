# Chat System

Server-side chat message routing for local, shout, party, guild, and notice channels using the Metin2 chat protocol.

## Protocol

### Inbound: CG_CHAT (`0x03`)

Sent by the client when a player sends a chat message.

| Field       | Type     | Size (bytes) | Description                      |
|-------------|----------|--------------|----------------------------------|
| header      | `byte`   | 1            | `0x03`                           |
| size        | `uint16` | 2            | Total packet size                |
| messageType | `byte`   | 1            | Chat type (see below)            |
| message     | `string` | variable     | Message text (null-terminated)   |

### Outbound: GC_CHAT (`0x04`)

Sent by the server to deliver a chat message to a client.

| Field       | Type     | Size (bytes) | Description                      |
|-------------|----------|--------------|----------------------------------|
| header      | `byte`   | 1            | `0x04`                           |
| size        | `uint16` | 2            | Total packet size                |
| messageType | `byte`   | 1            | Chat type                        |
| vid         | `uint32` | 4            | Sender's virtual ID (speech bubble) |
| empireId    | `byte`   | 1            | Sender's empire (name coloring)  |
| message     | `string` | variable     | Message text (null-terminated)   |

## Chat Types (`ChatMessageTypeEnum`)

| Value | Name      | Client prefix | Scope           | Color       |
|-------|-----------|---------------|-----------------|-------------|
| 0     | `NORMAL`  | (none)        | Nearby players  | White       |
| 1     | `INFO`    | -             | Self only       | Light red   |
| 2     | `NOTICE`  | -             | Server-wide     | Light tan   |
| 3     | `GROUP`   | `#`           | Party members   | Cyan        |
| 4     | `GUILD`   | `%`           | Guild members   | Yellow      |
| 5     | `COMMAND` | -             | Self only       | Light cyan  |
| 6     | `SHOUT`   | `!`           | Server-wide     | Light cyan  |
| 8     | `BIG_NOTICE` | -          | Server-wide     | Centered box |

## Validation

- Max message length: 512 characters (`CHAT_MAX_LEN`, Metin2 default — messages exceeding this are silently dropped)
- Message type must be a valid `ChatMessageTypeEnum` value
- Message must be a non-empty string

## Behavior

### Normal Chat (type 0)

- Player presses Enter, types message, sends
- Server prefixes player name: `"PlayerName: message"`
- Broadcast to sender (via `player.chat()`) + all nearby players (via `player.getNearbyEntities()`)
- Client renders message in chat window AND as speech bubble above sender character (using `vid` field)
- Messages starting with `/` are routed to `CommandManager` and NOT broadcast

### Shout Chat (type 6) — Server-Wide

- Player types `!message` or switches to shout mode via Tab
- Client strips `!` prefix before sending
- Client has its own 15-second cooldown (`localeInfo.CHAT_SHOUT_LIMIT`) — bypassed for GM/MOD (checks `player.GetMainCharacterName()` for `[GM]`/`[MOD]` prefix)
- Server validates (non-staff only):
  - Level >= 15 (otherwise INFO error: "You must be at least level 15 to shout.")
  - 15-second cooldown since last shout (otherwise INFO error with remaining seconds)
  - Staff (GM/MOD) bypass BOTH level check and cooldown entirely
- Broadcast to ALL players on the server (global, not map-only)
- Sender included in broadcast (sees own shout)

### Notice (type 2) — Server-Wide

- Server-only type: client-sent NOTICE packets are ignored
- GMs can broadcast via `/notice <message>` command
- Sent to ALL online players (regardless of map)
- `vid` and `empireId` set to 0 (no speech bubble, no empire coloring)
- Client displays in notice color (light tan)

### Party Chat (type 3) — Placeholder

- No party system implemented yet
- Returns INFO message: "You are not in a party"

### Guild Chat (type 4) — Placeholder

- No guild system implemented yet
- Returns INFO message: "You are not in a guild"

### Big Notice (type 8) — Server-Wide

- Server-only type: large centered text box displayed on screen (like OX quiz events)
- GMs can broadcast via `/bignotice <message>` command
- Sent to ALL online players (regardless of map)
- `vid` and `empireId` set to 0
- Client displays as a large semi-transparent box in center of screen

### Server-Only Types

Types that the server sends to clients but ignores if received from clients:

- **INFO (type 1)** — System messages displayed to the player (light red)
- **COMMAND (type 5)** — Internal client commands (e.g., `CloseRestartWindow`, `quit`)
- **NOTICE (type 2)** — Server-wide announcements (scrolling text at top)
- **BIG_NOTICE (type 8)** — Large centered box (OX quiz style)

## Message Format

The server prefixes the sender's display name to the message:

```
{player.getName()}: {message}
```

`player.getName()` includes role tags for staff (e.g., `|cFFFFA200[GM]PlayerName`).

The `vid` field in `ChatOutPacket` identifies which character the client should render the speech bubble above. The `empireId` determines name coloring for cross-empire visibility.

## Commands

| Command | Access | Description |
|---------|--------|-------------|
| `/notice <message>` | GM only | Broadcast server-wide notice to all players (top scrolling text) |
| `/bignotice <message>` | GM only | Broadcast large centered notice to all players (OX quiz style box) |

## Enum Values (Standard Metin2)

Server uses standard Metin2 values. If client differs, update `ChatMessageTypeEnum.ts` to match:

| Server Enum  | Value |
|--------------|-------|
| NORMAL       | 0     |
| INFO         | 1     |
| NOTICE       | 2     |
| GROUP        | 3     |
| GUILD        | 4     |
| COMMAND      | 5     |
| SHOUT        | 6     |
| BIG_NOTICE   | 8     |

## Key Server Files

| File | Description |
|------|-------------|
| `src/core/interface/networking/packets/packet/in/chat/ChatInPacketHandler.ts` | Routes chat by type, implements all channels |
| `src/core/interface/networking/packets/packet/in/chat/ChatInPacket.ts` | Inbound chat packet |
| `src/core/interface/networking/packets/packet/out/ChatOutPacket.ts` | Outbound chat packet |
| `src/core/enum/ChatMessageTypeEnum.ts` | Chat type constants |
| `src/core/domain/entities/game/player/Player.ts` | `chat()` and `sendChat()` methods |
| `src/game/domain/command/command/notice/` | `/notice` command (GM broadcast) |
| `src/game/domain/command/command/bignotice/` | `/bignotice` command (GM centered screen) |
