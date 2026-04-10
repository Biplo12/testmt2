# TODO

## Lastlogin Update in DB

- [ ] Update `auth.account.lastLogin` field on successful login
- [ ] Set timestamp in `LoginService` or `AuthTokenPacketHandler` after authentication

## Whisper System (DM / Private Messages)

### Sending
- [ ] Add `/whisper <playerName> <message>` command or use client's native whisper input
- [ ] Handle incoming whisper packet from client (`ChatInPacketHandler` with whisper type)
- [ ] Lookup target player by raw name via `World.getPlayerByName()`
- [ ] Send whisper message to target via `ChatOutPacket` with whisper message type
- [ ] Send confirmation/echo back to sender

### Receiving
- [ ] Target player receives `ChatOutPacket` with sender name and message
- [ ] Client opens whisper dialog window automatically (native TMP4 behavior)

### Error Handling
- [ ] Target player not found -> notify sender "Player not found"
- [ ] Target player is offline -> notify sender "Player is offline"
- [ ] Cannot whisper yourself -> reject with message
- [ ] Validate message length (not empty, max length)

### GM Differences
- [ ] GM can whisper to invisible/hidden players
- [ ] Whisper window icon for GM: use text placeholder "GM" or reuse the YMIR indicator icon that floats above GM characters (client-side decision - swap later for custom icon if needed)
- [ ] Optional: GM whispers have distinct color in chat window
- [ ] Optional: `/whisperall <message>` broadcast whisper to all online players (GM only)

### Visual / Client
- [ ] Verify TMP4 client whisper window opens correctly on receive
- [ ] Verify sender name displays properly (with role color codes already applied via getName())
- [ ] Whisper window GM icon: either text "GM" placeholder or the same affect-based icon from above the character - to be replaced with custom icon later by client artist
- [ ] Verify whisper tab/history works in client chat panel
