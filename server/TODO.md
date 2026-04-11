# TODO

## Lastlogin Update in DB

- [ ] Update `auth.account.lastLogin` field on successful login
- [ ] Set timestamp in `LoginService` or `AuthTokenPacketHandler` after authentication

## Logout on Login (Prevent Duplicate Sessions)

- [ ] When a player logs in, check if account already has an active session
- [ ] If active session exists, disconnect/logout the old session before allowing new login
- [ ] Prevent 2 clients from being connected on the same account simultaneously

## Whisper System (DM / Private Messages)

### Sending
- [x] Add `/whisper <playerName> <message>` command or use client's native whisper input
- [x] Handle incoming whisper packet from client (dedicated `WhisperInPacketHandler` with CG_WHISPER 0x13)
- [x] Lookup target player by raw name via `World.getPlayerByName()` (strips color codes and role tags)
- [x] Send whisper message to target via `WhisperOutPacket` (GC_WHISPER 0x22)
- [x] No server-side echo to sender (client handles sent message display locally)

### Receiving
- [x] Target player receives `WhisperOutPacket` with sender name and message
- [x] Client opens whisper dialog window automatically (native TMP4 behavior) - verified

### Error Handling
- [x] Target player not found -> notify sender via chat INFO message
- [x] Target player is offline -> notify sender via chat INFO message
- [x] Cannot whisper yourself -> reject with chat INFO message
- [x] Validate message (not empty) via `WhisperInPacketValidator`

### GM Differences
- [x] GM whisper shows `[GM]` tag with role color in whisper window title (via `getRoleTag()` color codes in partnerName)
- [x] GM can whisper to invisible/hidden players (works by default - World lookup ignores visibility)
- [x] Whisper window icon: GM YMIR icon replaces envelope on whisper button (client-side, transparent.tga + ExpandedImageBox overlay)
- [x] GM whisper dialog shows GM mark icon in corner (type=5 triggers `SetGameMasterLook`)
- [x] GM color changed from red (FF0000) to golden (FFA200)
- [x] `/whisperall <message>` broadcast whisper to all online players (GM only)

### Bugs
- [ ] Whisper button duplicates: opening/closing whisper creates duplicate buttons for the same player - check if button already exists before creating new one (client-side `__MakeWhisperButton`)

### Security / Rate Limiting
- [ ] Add rate limiting for whisper packets (prevent whisper flood/spam)
- [ ] Add max message length validation on server side (`WhisperInPacketHandler`)
- [ ] Add max message length validation for `/whisper` command (`WhisperCommandValidator`)

### Visual / Client
- [x] Verify TMP4 client whisper window opens correctly on receive - verified
- [x] Verify sender name displays properly with role color codes - verified
- [ ] Verify whisper tab/history works in client chat panel
- [ ] GM whisper: recipient sees no blinking envelope icon - only name text shows, no visual notification (client-side `__MakeWhisperButton` in `interfacemodule.py`)

## Chat System

### Enum Verification
- [ ] Verify chat type enum values match TMP4 client — server uses standard Metin2 values (NORMAL=0, INFO=1, NOTICE=2, GROUP=3, GUILD=4, COMMAND=5, SHOUT=6, BIG_NOTICE=8). If client differs, remap server enum.

### Normal Chat (Local)
- [ ] Verify normal chat broadcasts correctly to nearby players (test with 2+ players)
- [x] Broadcast normal chat to nearby players (area/local) via `nearbyEntities`
- [x] Include sender VID for speech bubble above character
- [x] Server prefixes player name to message
- [x] Commands (`/`) not broadcast — handled separately by CommandManager
- [x] Max message length validation (512 chars, Metin2 default `CHAT_MAX_LEN`)

### Shout Chat (Server-Wide)
- [x] Broadcast shout to ALL players on the server (global, not map-only) — verified
- [x] Cross-map delivery: vid=0 for players on different map (TMP4 client drops unknown VIDs)
- [x] 15-second cooldown stored on Player entity (persists across packet handler instances) — verified
- [x] Minimum level 15 required (constant `SHOUT_MIN_LEVEL`)
- [x] Cooldown remaining shown in error message
- [x] Staff bypass both level check and cooldown (server + client) — verified
- [x] Client-side cooldown removed (server handles it)

### Notice (Server-Wide)
- [ ] Verify `/notice` displays in notice color in client chat panel
- [x] `/notice <message>` GM command broadcasts NOTICE type to all players
- [x] Server-only type — client-sent NOTICE packets ignored

### Big Notice (Server-Wide, Centered Screen)
- [ ] Verify `/bignotice` displays large centered text box on client screen (like OX quiz, Image 1 in chat-system notes)
- [x] `BIG_NOTICE` type added to enum (value 8, standard Metin2)
- [x] `/bignotice <message>` GM command broadcasts BIG_NOTICE type to all players

### Party Chat
- [ ] Implement party/group system
- [x] Placeholder: "You are not in a party" INFO message

### Guild Chat
- [ ] Implement guild system
- [x] Placeholder: "You are not in a guild" INFO message

### Server-Only Types
- [x] INFO — server→client only, client packets ignored
- [x] COMMAND — server→client only, client packets ignored

### Bugs / Issues
- [x] ~~Staff shout bypass~~ — fixed: client-side cooldown removed, server handles all validation. GM confirmed working.

## Empire / Kingdom System

- [ ] Empire selection during character creation (Shinsoo, Chunjo, Jinno)
- [ ] Store empire ID on account/character in database
- [ ] Empire-based spawn points (different starting maps per empire)
- [ ] Empire-based PvP rules (cross-empire hostility)
- [ ] Empire name colors in chat/nametags
- [ ] Empire flag/icon display on characters
- [ ] Empire-restricted maps and zones
