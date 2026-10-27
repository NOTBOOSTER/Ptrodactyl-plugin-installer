<?php

namespace MinecraftPluginInstaller;

use Pterodactyl\Extensions\ExtensionProvider;

class MinecraftPluginInstallerProvider extends ExtensionProvider
{
    public function boot(): void
    {
        $this->registerApiRoutes();
    }
}
