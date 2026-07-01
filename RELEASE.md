# Release Guide — Aeth Hub v0.1.0

## Prerequisites

- Rust stable with `x86_64-pc-windows-gnu` toolchain
- Node.js 20+
- MSYS2 / MinGW (for Windows GNU toolchain)
- Git

## Step 1: Tag the Release

```bash
git tag -a v0.1.0 -m "v0.1.0 — First preview release"
git push origin v0.1.0
```

## Step 2: Build the Installer

```bash
# Clean build
npm install
npm run build

# Build the NSIS installer
cd src-tauri
cargo tauri build
```

The NSIS installer will be at:
`src-tauri/target/release/bundle/nsis/Aeth Hub_0.1.0_x64-setup.exe`

## Step 3: Create GitHub Release

1. Go to `https://github.com/thevirgindev/Aeth-Hub/releases/new`
2. Select tag `v0.1.0`
3. Title: `v0.1.0 — First Preview`
4. Body:

```markdown
### Aeth Hub v0.1.0 — First Preview

The initial preview release. Anime browsing and streaming are functional.

#### What's Included
- Anime catalog browsing via AniList
- HTML5 torrent streaming player
- Download manager with queue
- Continue watching / favorites
- External player support (mpv/VLC)
- Discord Rich Presence
- Theme system (Dark + Pixelated Space)
- Keyboard shortcuts

#### Notes
- Windows only (NSIS installer)
- WebView2 required (included with Windows 11 / Edge)
- Only anime content is accessible in this preview
```

5. Attach the NSIS installer from `src-tauri/target/release/bundle/nsis/Aeth Hub_0.1.0_x64-setup.exe`
6. Publish release

## Step 4: Update Check

The app checks `https://api.github.com/repos/thevirgindev/Aeth-Hub/releases/latest` on startup.
If a newer version is found, a notification appears in the bottom-right.

## Step 5: Post-Release

- Update version in `src-tauri/tauri.conf.json` and `src/lib/update-check.ts`
- Write changelog for next version
- Announce on Discord / Patreon / Ko-fi

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Installer blocked by SmartScreen | Click "More info" → "Run anyway" |
| WebView2 not found | Install from https://developer.microsoft.com/en-us/microsoft-edge/webview2/ |
| Antivirus flags the binary | This is a false positive — the app uses torrent networking. Submit to vendor for whitelist. |
