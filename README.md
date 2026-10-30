# Ptrodactyl Plugin Installer for Pterodactyl 2.0

Ptrodactyl Plugin Installer is a native Pterodactyl 2.0 extension that allows server owners and administrators to search, discover, and install Minecraft server plugins directly into `/plugins` from Modrinth, SpigotMC, and Hangar.

Developed by **Bhaskar** ([StrayStudios](https://github.com/StrayStudios)).

---

## Features

- **Multi-Provider Search**: Discover plugins across Modrinth, SpigotMC, and Hangar without needing API keys.
- **Direct Installation**: One-click download directly to the server's `/plugins` folder.
- **Version Compatibility**: Filter by Minecraft versions (e.g. 1.21, 1.20.4, 1.19) and server software/loaders (Paper, Velocity, Waterfall, Purpur).
- **Installed Detection & Management**: Real-time badge count and direct management (view/delete) of installed `.jar` files in the server's `/plugins` directory.
- **Native Pterodactyl 2.0 Experience**: Fully integrated with `@pterodactyl/sdk`, Tailwind CSS, and panel permissions (`file.create`, `file.update`).
- **Automatic Minecraft Detection**: Only displays on servers running Minecraft software (e.g. Paper MC, Spigot, Purpur).

---

## Installation

Run this one-liner command from your Pterodactyl panel root directory (`/var/www/pterodactyl`):

```bash
cd /var/www/pterodactyl && git clone https://github.com/NOTBOOSTER/Ptrodactyl-plugin-installer.git extensions/ptrodactyl-plugin-installer && cd extensions/ptrodactyl-plugin-installer && npm install && npm run build && cd /var/www/pterodactyl && php artisan p:extension:install extensions/ptrodactyl-plugin-installer --enable && php artisan optimize:clear
```

---

## Update Existing Installation

If you already have the extension installed on your panel, run this command to update:

```bash
cd /var/www/pterodactyl/extensions/ptrodactyl-plugin-installer && git pull origin main && npm run build && cd /var/www/pterodactyl && php artisan p:extension:install extensions/ptrodactyl-plugin-installer --enable && php artisan optimize:clear
```

---

## Manual Step-by-Step Installation

1. Clone the repository into `extensions/ptrodactyl-plugin-installer`:
```bash
cd /var/www/pterodactyl
git clone https://github.com/NOTBOOSTER/Ptrodactyl-plugin-installer.git extensions/ptrodactyl-plugin-installer
```

2. Build the client bundle:
```bash
cd extensions/ptrodactyl-plugin-installer
npm install
npm run build
```

3. Register and enable the extension:
```bash
cd /var/www/pterodactyl
php artisan p:extension:install extensions/ptrodactyl-plugin-installer --enable
php artisan optimize:clear
```

---

## License

MIT License. Developed by Bhaskar (StrayStudios).
