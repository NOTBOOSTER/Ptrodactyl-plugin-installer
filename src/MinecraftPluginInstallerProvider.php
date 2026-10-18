<?php

namespace MinecraftPluginInstaller;

use Pterodactyl\Extensions\ExtensionProvider;
use Pterodactyl\Services\Extensions\ExtensionSettingDefinition;
use Pterodactyl\Services\Extensions\ExtensionSettingsDefinition;

class MinecraftPluginInstallerProvider extends ExtensionProvider
{
    public function boot(): void
    {
        $this->registerApiRoutes();

        $this->registerSettings(new ExtensionSettingsDefinition($this->settings(), [
            ExtensionSettingDefinition::make('curseforge_api_key', 'curseforge_api_key', '', ['nullable', 'string', 'max:2000'])
                ->label('CurseForge API Key')
                ->help('CurseForge API key required for CurseForge plugin searches and downloads.')
                ->secret(),
        ]));
    }
}
