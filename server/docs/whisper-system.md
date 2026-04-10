# Whisper System (Private Messages)

Server-side and client-side implementation for private messaging between players using the native Metin2 whisper protocol.

## Protocol

Whisper uses **dedicated packets**, separate from general chat (`CHAT_IN`/`CHAT_OUT`).

### Inbound: CG_WHISPER (`0x13`)

Sent by the client when a player sends a whisper via the whisper window or `/whisper` command.

| Field      | Type     | Size (bytes) | Description                         |
|------------|----------|--------------|-------------------------------------|
| header     | `byte`   | 1            | `0x13`                              |
| size       | `uint16` | 2            | Total packet size                   |
| targetName | `string` | 25           | Target player name (null-padded)    |
| message    | `string` | variable     | Whisper message text                |

### Outbound: GC_WHISPER (`0x22`)

Sent by the server to deliver a whisper message or error to a client.

| Field       | Type     | Size (bytes) | Description                         |
|-------------|----------|--------------|-------------------------------------|
| header      | `byte`   | 1            | `0x22`                              |
| size        | `uint16` | 2            | Total packet size                   |
| type        | `byte`   | 1            | Whisper type (see below)            |
| partnerName | `string` | 25           | Partner player name (null-padded)   |
| message     | `string` | variable     | Whisper message text                |

#### Whisper Types (`WhisperTypeEnum`)

| Value | Name           | Description                                        |
|-------|----------------|----------------------------------------------------|
| 0     | `NORMAL`       | Regular whisper message                            |
| 1     | `NOT_FOUND`    | Target player not found / offline                  |
| 2     | `BLOCKED`      | Target has blocked whispering (client-side display)|
| 3     | `SENDER_BLOCKED` | Sender blocked (client-side display)             |
| 5     | `GM`           | GM whisper — triggers `SetGameMasterLook` on client|

> **Note:** Types 1-3 route to `OnRecvWhisperError` on the client. Types 0 and 5 route to `OnRecvWhisper`. Type 5 triggers `RegisterGameMasterName()` and shows YMIR icon in whisper dialog.

## Flow

### Sending a Whisper (via whisper window)

1. Client sends `CG_WHISPER` (`0x13`) with target name and message
2. `WhisperInPacketHandler` validates the packet
3. Server strips color codes and role tags from target name for lookup
4. Server looks up target player via `World.getPlayerByName()`
5. If found: sends `GC_WHISPER` to **target only** (no echo to sender — client handles sent message display locally)
6. If not found: sends chat INFO message to sender
7. If self-whisper: silently ignored (no message)

### Sending a Whisper (via /whisper command)

1. Player types `/whisper <playerName> <message>` in chat
2. Client sends `CHAT_IN` (`0x03`) with `messageType=NORMAL`
3. `ChatInPacketHandler` routes to `CommandManager`
4. `WhisperCommandHandler` performs same lookup and sends `GC_WHISPER` to target

## Error Handling

| Scenario               | Server Response                                           |
|------------------------|-----------------------------------------------------------|
| Target not found       | Chat INFO message: "Player X is not online."              |
| Target offline         | Chat INFO message: "Player X is not online."              |
| Whisper to self        | Silently ignored                                          |
| Invalid packet         | Connection closed                                         |

## GM Features

### Server-side
- GM whispers sent with `type=GM` (5) — triggers GM look on client
- GM identity shown via `[GM]` tag with golden color (`FFA200`) in `partnerName`
- Tag added using `getRoleTag()` with color codes from `ROLE_CONFIG`
- Handler strips color codes (`|cFF......`) and role tags (`[GM]`, `[MOD]`) from incoming target names via regex before player lookup
- GM can whisper invisible/hidden players (World lookup ignores visibility)
- `/whisperall <message>` — GM-only command that broadcasts whisper to all online players

### Client-side
- `type=5` triggers `RegisterGameMasterName(name)` and `SetGameMasterLook()` (YMIR icon in dialog corner)
- `IsGameMasterName()` also detects GM by `[GM]`/`[MOD]` tag prefix (works when manually typing GM name)
- GM whisper button: envelope replaced with YMIR icon (`ymirred.tga` via `ExpandedImageBox` overlay, `transparent.tga` hides envelope)
- GM tooltip color: golden `0xFFFFA200`

## Client Pack Workflow

Client Python files are in `client/pack/root/`. The client reads from encrypted `root.epk`, not loose files.

### How to apply client changes:

1. Edit files in `client/pack/root/` (e.g. `interfacemodule.py`, `uiwhisper.py`)
2. Open `client/Eternexus/EterNexus.exe`
3. File → **Pack Archive** → select folder `client/pack/root`
4. EterNexus overwrites `client/pack/root.eix` and `client/pack/root.epk`
5. Restart client

### Important: `serverinfo.py`

`client/pack/root/serverinfo.py` contains server connection config. When repacking, make sure it has the correct values:
- `SERVER_IP = "localhost"` (or your server IP)
- `PORT_AUTH = 11002`
- `PORT_1 = 13001`

### Client files modified for whisper system:

| File | Changes |
|------|---------|
| `client/pack/root/interfacemodule.py` | GM whisper button (YMIR icon overlay, transparent envelope), `IsGameMasterName()` tag detection, `__CheckGameMaster()` uses `IsGameMasterName()` |
| `client/pack/root/uiwhisper.py` | `OpenWithTarget()` auto-detects GM by `[GM]`/`[MOD]` tag and applies `SetGameMasterLook()` |
| `client/pack/root/transparent.tga` | 1x1 transparent image used to hide envelope button visual |

## Key Server Files

| File | Description |
|------|-------------|
| `server/src/core/interface/networking/packets/packet/in/whisper/WhisperInPacket.ts` | Inbound whisper packet |
| `server/src/core/interface/networking/packets/packet/in/whisper/WhisperInPacketHandler.ts` | Handles incoming whispers |
| `server/src/core/interface/networking/packets/packet/in/whisper/WhisperInPacketValidator.ts` | Validates whisper packets |
| `server/src/core/interface/networking/packets/packet/out/WhisperOutPacket.ts` | Outbound whisper packet + `WhisperTypeEnum` |
| `server/src/game/domain/command/command/whisper/WhisperCommand.ts` | `/whisper` slash command |
| `server/src/game/domain/command/command/whisper/WhisperCommandHandler.ts` | `/whisper` handler |
| `server/src/game/domain/command/command/whisperall/WhisperAllCommandHandler.ts` | `/whisperall` GM broadcast |
| `server/src/core/domain/entities/game/player/Player.ts` | `whisper()` method |
| `server/src/core/enum/PacketHeaderEnum.ts` | `WHISPER: 0x13`, `WHISPER_OUT: 0x22` |
| `server/src/core/enum/AccountRoleEnum.ts` | GM role config with golden color (`FFA200`) |
