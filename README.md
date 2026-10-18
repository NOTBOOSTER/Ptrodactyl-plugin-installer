# Minecraft Plugin Installer for Pterodactyl 2.0

Minecraft Plugin Installer is a native Pterodactyl 2.0 extension that allows server owners and administrators to search, discover, and install Minecraft server plugins directly into `/plugins` from Modrinth, SpigotMC, CurseForge, and Hangar.

Developed by **Bhaskar** ([StrayStudios](https://github.com/StrayStudios)).

---

## Features

- **Multi-Provider Search**: Discover plugins across Modrinth, SpigotMC, CurseForge, and Hangar.
- **Direct Installation**: One-click download directly to `/plugins` via Wings daemon file repository.
- **Version Compatibility**: Filter by Minecraft versions (e.g., 1.21, 1.20.4, 1.19) and server software/loaders (Paper, Velocity, Waterfall, Purpur).
- **Installed Detection**: Instant badge count of installed `.jar` files in the server's `/plugins` directory.
- **Native Pterodactyl 2.0 Experience**: Fully integrated with `@pterodactyl/sdk`, Tailwind CSS, and panel permissions (`file.create`, `file.update`).
- **Encrypted Admin Settings**: Securely store and manage your CurseForge API key in **Admin → Extensions**.

---

## Installation

### From Pre-built Package
1. Download the `minecraft-plugin-installer.pteroext` release archive.
2. In your Pterodactyl 2.0 Admin Area, navigate to **Admin → Extensions**.
3. Upload the `.pteroext` file and click **Enable**.

Or install via CLI from the panel root:
```bash
php artisan p:extension:install extensions/minecraft-plugin-installer --enable
```

---

## Configuration

To enable CurseForge mod and plugin searches:
1. Obtain an API key from the [CurseForge Developer Console](https://console.curseforge.com).
2. Go to **Admin → Extensions → Minecraft Plugin Installer**.
3. Paste your CurseForge API key into the encrypted field and save.

---

## Building from Source

Requirements:
- PHP 8.3+
- Node.js 22+

Install dependencies and build the frontend bundle:
```bash
npm install
npm run typecheck
npm run build
```

Package the extension for distribution:
```bash
php artisan p:extension:pack extensions/minecraft-plugin-installer --output=minecraft-plugin-installer.pteroext
```

---

## License

MIT License. Developed by Bhaskar (StrayStudios).
