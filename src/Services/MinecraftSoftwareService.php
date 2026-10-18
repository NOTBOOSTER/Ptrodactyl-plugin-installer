<?php

namespace MinecraftPluginInstaller\Services;

use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;

class MinecraftSoftwareService
{
    protected ?Server $server = null;
    protected ?DaemonFileRepository $fileRepository = null;

    public function __construct(?DaemonFileRepository $fileRepository = null)
    {
        $this->fileRepository = $fileRepository;
    }

    public function setServer(Server $server): self
    {
        $this->server = $server;

        return $this;
    }

    protected function getFileRepository(): DaemonFileRepository
    {
        if ($this->fileRepository === null) {
            $this->fileRepository = app()->bound(DaemonFileRepository::class)
                ? app(DaemonFileRepository::class)
                : new DaemonFileRepository(app());
        }

        if ($this->server !== null) {
            $this->fileRepository->setServer($this->server);
        }

        return $this->fileRepository;
    }

    public function getInstalledProjectsVersions(string $directory): array
    {
        try {
            $files = $this->getFileRepository()->getDirectory($directory);
        } catch (\Throwable) {
            return [
                'identified' => [],
                'other' => [],
            ];
        }

        $jarFiles = array_filter($files['files'] ?? [], function ($file) {
            return pathinfo($file['name'] ?? '', PATHINFO_EXTENSION) === 'jar';
        });

        $identified = [];
        $other = [];

        foreach ($jarFiles as $file) {
            $other[] = $file['name'] ?? '';
        }

        return [
            'identified' => $identified,
            'other' => array_values(array_filter($other)),
        ];
    }
}
