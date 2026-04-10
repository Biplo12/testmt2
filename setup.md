# TestMT2 — Instrukcja Setup

## Wymagania

- **Node.js** 20+ (lub **Bun**)
- **Docker Desktop**
- **Klient TMP4** (40k client)
- **Eternexus** (do edycji packów klienta)

## Struktura projektu

```
testmt2/
├── server/                          ← fork open-mt2 (Node.js/TypeScript)
│   ├── .env                         ← konfiguracja portów i haseł
│   ├── docker-compose.dep.yml       ← MySQL + Redis
│   ├── src/
│   │   ├── auth/                    ← serwer logowania (port 11002)
│   │   ├── game/                    ← serwer gry (port 13001)
│   │   └── core/                    ← wspólna logika, pakiety, encje
│   │       └── infra/config/data/   ← dane gry (itemy, moby, mapy — JSON)
│   └── tools/database/              ← migracja bazy danych
│
└── Client/                          ← klient TMP4
    ├── metin2client.exe             ← uruchamiasz to
    ├── pack/
    │   ├── root.eix / root.epk      ← spakowane pliki Pythona (serverinfo.py itd.)
    │   └── ...                      ← inne paczki (locale, uiscript, itp.)
    ├── root/                        ← luźne pliki (nadpisują pack/root)
    └── Eternexus/                   ← narzędzie do rozpakowywania/pakowania
```

## Pierwsze uruchomienie

### 1. Serwer

```bash
cd server

# Skopiuj konfigurację
cp .env.example .env          # Linux/Mac
copy .env.example .env        # Windows

# Zainstaluj zależności
bun install                   # lub: npm install

# Uruchom MySQL + Redis w Docker
npm run docker:dep
# Poczekaj ~30 sekund aż MySQL wstanie

# Migracja bazy danych (tworzy tabele i konta)
bun run migrate               # lub: npm run migrate

# Terminal 1 — Auth server
bun run dev:auth

# Terminal 2 — Game server
bun run dev:game
```

### 2. Klient

Edytuj `serverinfo.py` (w packu root — patrz sekcja "Edycja plików klienta"):

```python
SERVER_NAME       = "TestMT2"
SERVER_IP         = "127.0.0.1"
CH1_NAME          = "CH1"
PORT_1            = 13001
PORT_AUTH         = 11002
PORT_MARK         = 13001

STATE_NONE = "..."

STATE_DICT = {
    0 : "....",
    1 : "NORM",
    2 : "BUSY",
    3 : "FULL"
}

SERVER01_CHANNEL_DICT = {
    1:{"key":11,"name":CH1_NAME,"ip":SERVER_IP,"tcp_port":PORT_1,"udp_port":PORT_1,"state":STATE_NONE,},
}

REGION_NAME_DICT = {
    0 : "",
}

REGION_AUTH_SERVER_DICT = {
    0 : {
        1 : { "ip":SERVER_IP, "port":PORT_AUTH, },
    }
}

REGION_DICT = {
    0 : {
        1 : { "name" :SERVER_NAME, "channel" : SERVER01_CHANNEL_DICT, },
    },
}

MARKADDR_DICT = {
    10 : { "ip" : SERVER_IP, "tcp_port" : PORT_MARK, "mark" : "10.tga", "symbol_path" : "10", },
}
```

### 3. Logowanie

Uruchom `metin2client.exe` i zaloguj się:

| Login    | Hasło   |
|----------|---------|
| admin    | admin   |
| admin1   | admin   |

## Edycja plików klienta (pakowanie Eternexusem)

Klient TMP4 czyta pliki Pythona ze spakowanych archiwów `.eix/.epk` w folderze `pack/`.
Luźne pliki w `Client/root/` **nie** są priorytetyzowane. Trzeba edytować plik w packu.

### Procedura zmiany dowolnego pliku w pack/root:

1. **Rozpakuj** (jednorazowo):
    - Eternexus → File → Extract Archive → wybierz `pack/root.eix`
    - Pliki pojawią się w `Eternexus/root/`

2. **Edytuj** plik w `Eternexus/root/` (np. `serverinfo.py`)

3. **Skopiuj** edytowane pliki do folderu roboczego w `pack/`:
   ```powershell
   New-Item -ItemType Directory -Path Client\pack\root_build -ErrorAction SilentlyContinue
   Copy-Item Client\Eternexus\root\* Client\pack\root_build\ -Recurse -Force
   ```

4. **Spakuj** Eternexusem:
    - Eternexus → File → Pack Archive → wybierz folder `pack/root_build`
    - Poczekaj aż zakończy (pojawią się `root_build.eix` i `root_build.epk`)

5. **Podmień** stare paczki:
   ```powershell
   cd Client\pack
   Remove-Item root.eix -Force
   Remove-Item root.epk -Force
   Rename-Item root_build.eix root.eix
   Rename-Item root_build.epk root.epk
   ```

6. **Posprzątaj**:
   ```powershell
   Remove-Item Client\pack\root_build -Recurse -Force
   ```

7. **Zrestartuj klienta**

## Plik .env — opis zmiennych

### Serwery gry
| Zmienna | Wartość | Opis |
|---------|---------|------|
| `AUTH_SERVER_PORT` | 11002 | Port auth servera — klient łączy się tu pierwszy |
| `AUTH_SERVER_ADDRESS` | 127.0.0.1 | Adres nasłuchu auth |
| `GAME_SERVER_PORT` | 13001 | Port game servera — tu trafiasz po logowaniu |
| `GAME_SERVER_ADDRESS` | 127.0.0.1 | Adres nasłuchu game |
| `LOG_LEVEL` | debug | Poziom logów: debug / info / warn / error |

### Baza danych MySQL
| Zmienna | Wartość | Opis |
|---------|---------|------|
| `DB_HOST` | 127.0.0.1 | Adres MySQL (Docker udostępnia) |
| `DB_PORT` | 3306 | Standardowy port MySQL |
| `DB_ROOT_PASSWORD` | 123456 | Hasło root MySQL — zmień na produkcji! |
| `DB_USER` | root | Użytkownik bazy |
| `AUTH_DB_DATABASE_NAME` | auth | Baza kont (account, account_status) |
| `GAME_DB_DATABASE_NAME` | game | Baza gry (player, item) |

### Cache Redis
| Zmienna | Wartość | Opis |
|---------|---------|------|
| `CACHE_HOST` | 127.0.0.1 | Adres Redis |
| `CACHE_PORT` | 6379 | Standardowy port Redis |

**Ważne:** Porty w `.env` muszą zgadzać się z portami w `serverinfo.py` klienta!

## Schemat bazy danych

### Baza `auth`
- **account_status** — statusy kont (OK, banned, itp.)
- **account** — konta graczy (username, password bcrypt, email)

### Baza `game`
- **player** — postacie (nazwa, klasa, poziom, statystyki, pozycja, ekwipunek)
- **item** — przedmioty (właściciel, pozycja w ekwipunku, sockety, atrybuty)

## Komendy w grze

| Komenda | Opis | Przykład |
|---------|------|---------|
| `/help` | Lista wszystkich komend | `/help` |
| `/exp` | Dodaj doświadczenie | `/exp 1000` |
| `/gold` | Dodaj złoto | `/gold 50000` |
| `/goto` | Teleportacja | `/goto map_a2` |
| `/invoke` | Przywołaj moba | `/invoke 101 5` |
| `/item` | Stwórz przedmiot | `/item 19 1` |
| `/list` | Lista zasobów | `/list areas` |
| `/lvl` | Ustaw poziom | `/lvl 50` |
| `/stat` | Dodaj punkty statystyk | `/stat ht 90` |
| `/priv` | Dodaj przywileje | `/priv empire blue exp 100 1000` |

## Architektura serwera (src/)

```
src/
├── auth/                    ← Serwer autoryzacji
│   ├── interface/networking ← Obsługa pakietów auth
│   ├── app/service          ← Logika logowania
│   └── infra/               ← Baza danych auth
│
├── game/                    ← Serwer gry
│   ├── interface/networking ← Obsługa pakietów game
│   ├── domain/service       ← Logika gry
│   ├── domain/command       ← Komendy chatowe (/gold, /item, itp.)
│   └── app/service          ← Serwisy aplikacyjne
│
└── core/                    ← Wspólny kod
    ├── domain/entities/     ← Encje (Player, Mob, Item, Character)
    ├── domain/quests/       ← System questów
    ├── domain/manager/      ← Managery (spawn, item, mob)
    ├── interface/networking/ ← Definicje pakietów sieciowych
    └── infra/config/data/   ← Dane gry (JSON)
        ├── items.json       ← Definicje przedmiotów
        ├── mobs.json        ← Definicje mobów/NPC
        ├── jobs.json        ← Klasy postaci
        ├── empire.json      ← Imperia
        ├── spawn/           ← Spawny mobów na mapach
        └── exp/             ← Tabele doświadczenia
```

## Znane problemy

- Błędy `monster not found with vnum: 2137/2138` — brakujące definicje mobów w danych. Nie wpływa na grę.
- Błędy `group collection not found with vnum: 2410` — brakujące grupy spawnów. Nie wpływa na grę.
- System walki i skille są niekompletne (projekt w rozwoju).

## Przydatne linki

- Repo: https://github.com/willianmarquess/open-mt2
- Dokumentacja pakietów: `server/docs/packets.md`
- Dokumentacja questów: `server/docs/quests.md`
- Przewodnik: `server/docs/guide.md`