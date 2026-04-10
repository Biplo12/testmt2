# Whisper System (Private Messages)

Server-side implementation for private messaging between players using the native Metin2 whisper protocol.

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

| Value | Name        | Description                                        |
|-------|-------------|----------------------------------------------------|
| 0     | `NORMAL`    | Regular whisper message                            |
| 1     | `NOT_FOUND` | Target player not found / offline                  |
| 2     | `BLOCKED`   | Target has blocked whispering (client-side display)|

> **Note:** GM identity in whispers is conveyed through the `[GM]` tag in the `partnerName` field (e.g. `[GM]biplo12`), not through the type field. Type=2 triggers "has blocked whispering" in the TMP4 client.

## Flow

### Sending a Whisper (via whisper window)

1. Client sends `CG_WHISPER` (`0x13`) with target name and message
2. `WhisperInPacketHandler` validates the packet
3. Server looks up target player via `World.getPlayerByName()`
4. If found: sends `GC_WHISPER` to **target** (with sender's name) and **echo** to sender (with target's name)
5. If not found: sends `GC_WHISPER` with `type=NOT_FOUND` to sender

### Sending a Whisper (via /whisper command)

1. Player types `/whisper <playerName> <message>` in chat
2. Client sends `CHAT_IN` (`0x03`) with `messageType=NORMAL`
3. `ChatInPacketHandler` routes to `CommandManager`
4. `WhisperCommandHandler` performs same lookup and sends `GC_WHISPER` packets

## Error Handling

| Scenario               | Server Response                                           |
|------------------------|-----------------------------------------------------------|
| Target not found       | `GC_WHISPER` with `type=NOT_FOUND` to sender              |
| Target offline         | `GC_WHISPER` with `type=NOT_FOUND` to sender              |
| Whisper to self        | `GC_WHISPER` with `type=NOT_FOUND` to sender              |
| Invalid packet         | Connection closed                                         |

## GM Features

- GM identity is shown via the `[GM]` tag prefix in the `partnerName` field (e.g. `[GM]biplo12`)
- The tag is added using `getRawRoleTag()` (without color codes to fit the 25-byte name field)
- When a reply is received from a tagged name, the handler strips the tag via regex before player lookup
- All whispers use `type=NORMAL` (0) regardless of sender role — type=2 means "blocked" in TMP4 client

## Key Files

| File | Description |
|------|-------------|
| `src/core/interface/networking/packets/packet/in/whisper/WhisperInPacket.ts` | Inbound whisper packet |
| `src/core/interface/networking/packets/packet/in/whisper/WhisperInPacketHandler.ts` | Handles incoming whispers |
| `src/core/interface/networking/packets/packet/in/whisper/WhisperInPacketValidator.ts` | Validates whisper packets |
| `src/core/interface/networking/packets/packet/out/WhisperOutPacket.ts` | Outbound whisper packet + `WhisperTypeEnum` |
| `src/game/domain/command/command/whisper/WhisperCommand.ts` | `/whisper` slash command definition |
| `src/game/domain/command/command/whisper/WhisperCommandHandler.ts` | `/whisper` command handler |
| `src/game/domain/command/command/whisper/WhisperCommandValidator.ts` | `/whisper` command validation |
| `src/core/domain/entities/game/player/Player.ts` | `whisper()` method on Player |
| `src/core/enum/ChatMessageTypeEnum.ts` | `WHISPER = 16` (chat enum, used internally) |
| `src/core/enum/PacketHeaderEnum.ts` | `WHISPER: 0x13`, `WHISPER_OUT: 0x22` |
