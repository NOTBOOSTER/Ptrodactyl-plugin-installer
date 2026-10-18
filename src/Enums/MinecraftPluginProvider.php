<?php

namespace MinecraftPluginInstaller\Enums;

enum MinecraftPluginProvider: string
{
    case CurseForge = 'curseforge';
    case Hangar = 'hangar';
    case Modrinth = 'modrinth';
    case SpigotMC = 'spigotmc';
}
