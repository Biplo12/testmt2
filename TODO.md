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
- [ ] Whisper window icon: when GM sends whisper, show GM/YMIR icon instead of default envelope icon (client-side change)
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
