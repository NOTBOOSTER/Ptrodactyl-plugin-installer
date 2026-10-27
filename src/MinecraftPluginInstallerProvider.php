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

            ExtensionSettingDefinition::make('show_nav_tab', 'show_nav_tab', true, ['boolean'])
                ->label('Enable Plugins Navigation Item')
                ->help('Toggle whether the Plugins navigation item is visible on servers.')
                ->field('toggle')
                ->frontend(),

            ExtensionSettingDefinition::make('allowed_egg_ids', 'allowed_egg_ids', '', ['nullable', 'string', 'max:255'])
                ->label('Allowed Egg IDs (Optional)')
                ->help('Comma-separated list of Egg IDs (e.g. 1, 2, 5) where plugin installation is permitted. Leave blank to allow on all server eggs.')
                ->field('text')
                ->frontend(),
        ]));
    }
}
