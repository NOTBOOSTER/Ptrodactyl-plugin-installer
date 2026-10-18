<?php

namespace MinecraftPluginInstaller\Services;

use Pterodactyl\Models\Server;

class MinecraftSoftwareService
{
    protected ?Server $server = null;

    public function setServer(Server $server): self
    {
        $this->server = $server;

        return $this;
    }

    public function getInstalledProjectsVersions(string $directory): array
    {
        return [
            'identified' => [],
            'other' => [],
        ];
    }
}
