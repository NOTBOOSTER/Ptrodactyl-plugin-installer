<?php

namespace MinecraftPluginInstaller\Services;

use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;

class MinecraftSoftwareService
{
    protected Server $server;
    protected DaemonFileRepository $fileRepository;

    public function __construct(DaemonFileRepository $fileRepository)
    {
        $this->fileRepository = $fileRepository;
    }

    public function setServer(Server $server): self
    {
        $this->server = $server;
        $this->fileRepository->setServer($server);

        return $this;
    }

    public function getInstalledProjectsVersions(string $directory): array
    {
        try {
            $files = $this->fileRepository->getDirectory($directory);
        } catch (\Exception $e) {
            return [
                'identified' => [],
                'other' => [],
            ];
        }

        $jarFiles = array_filter($files['files'] ?? [], function ($file) {
            return pathinfo($file['name'], PATHINFO_EXTENSION) === 'jar';
        });

        $identified = [];
        $other = [];

        foreach ($jarFiles as $file) {
            $other[] = $file['name'];
        }

        return [
            'identified' => $identified,
            'other' => $other,
        ];
    }
}
