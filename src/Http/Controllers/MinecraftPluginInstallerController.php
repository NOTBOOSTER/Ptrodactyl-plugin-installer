<?php

namespace MinecraftPluginInstaller\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Pterodactyl\Models\Server;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Services\Extensions\ExtensionSettingsRegistry;
use MinecraftPluginInstaller\Enums\MinecraftPluginProvider;
use MinecraftPluginInstaller\Services\AbstractPluginService;
use MinecraftPluginInstaller\Services\HangarPluginService;
use MinecraftPluginInstaller\Services\ModrinthPluginService;
use MinecraftPluginInstaller\Services\SpigotMCPluginService;
use MinecraftPluginInstaller\Services\CurseForgePluginService;
use MinecraftPluginInstaller\Services\MinecraftSoftwareService;

class MinecraftPluginInstallerController
{
    public function index(Request $request, Server $server): array
    {
        abort_unless($request->user()->can('file.read-content', $server) || $request->user()->can('file.update', $server), 403);

        $validated = $request->validate([
            'provider' => ['required', Rule::enum(MinecraftPluginProvider::class)],
            'page' => 'required|numeric|integer|min:1',
            'page_size' => 'required|numeric|integer|max:50',
            'search_query' => 'nullable|string',
            'minecraft_version' => 'nullable|string',
            'plugin_loader' => 'nullable|string',
            'sort' => 'nullable|string',
        ]);

        $provider = MinecraftPluginProvider::from($validated['provider']);
        $page = (int) $validated['page'];
        $pageSize = (int) $validated['page_size'];
        $searchQuery = $validated['search_query'] ?? '';
        $minecraftVersion = $validated['minecraft_version'] ?? '';
        $pluginLoader = $validated['plugin_loader'] ?? '';
        $sort = $validated['sort'] ?? 'relevance';

        $service = $this->getPluginService($provider);
        if ($provider === MinecraftPluginProvider::Hangar) {
            $pageSize = min($pageSize, HangarPluginService::MAX_PAGE_SIZE);
        }

        $data = $service->search(compact('searchQuery', 'pageSize', 'page', 'minecraftVersion', 'pluginLoader', 'sort'));
        $plugins = $data['data'];

        return [
            'object' => 'list',
            'data' => $plugins,
            'meta' => [
                'pagination' => [
                    'total' => $data['total'],
                    'count' => count($plugins),
                    'per_page' => $pageSize,
                    'current_page' => $page,
                    'total_pages' => ceil($data['total'] / $pageSize),
                    'links' => [],
                ],
            ],
        ];
    }

    public function versions(Request $request, Server $server, string $pluginId): array
    {
        abort_unless($request->user()->can('file.read-content', $server) || $request->user()->can('file.update', $server), 403);

        $validated = $request->validate([
            'provider' => ['required', Rule::enum(MinecraftPluginProvider::class)],
            'plugin_loader' => 'nullable|string',
            'minecraft_version' => 'nullable|string',
        ]);

        $provider = MinecraftPluginProvider::from($validated['provider']);
        $pluginLoader = $validated['plugin_loader'] ?? null;
        $minecraftVersion = $validated['minecraft_version'] ?? null;

        $service = $this->getPluginService($provider);
        $pluginDetails = $service->getPluginDetails($pluginId);
        $versions = $service->versions($pluginId, $pluginLoader, $minecraftVersion);

        return [
            'project' => $pluginDetails,
            'versions' => $versions,
        ];
    }

    public function install(Request $request, Server $server): Response
    {
        abort_unless($request->user()->can('file.create', $server), 403);

        $validated = $request->validate([
            'provider' => ['required', Rule::enum(MinecraftPluginProvider::class)],
            'plugin_id' => 'required|string',
            'version' => 'required|string',
        ]);

        $provider = MinecraftPluginProvider::from($validated['provider']);
        $pluginId = $validated['plugin_id'];
        $versionId = $validated['version'];

        $service = $this->getPluginService($provider);
        $downloadDetails = $service->getDownloadDetails($pluginId, $versionId);

        try {
            $pullOptions = [
                'foreground' => true,
                'filename' => $downloadDetails['fileName'] ?? null,
                'use_header' => $downloadDetails['use_header'] ?? true,
            ];

            foreach ($downloadDetails as $key => $value) {
                if (!in_array($key, ['downloadUrl', 'fileName', 'use_header'])) {
                    $pullOptions[$key] = $value;
                }
            }

            $this->getFileRepository($server)->pull(
                $downloadDetails['downloadUrl'],
                '/plugins',
                $pullOptions
            );
        } catch (\Exception $e) {
            logger()->error('Failed to download plugin', [
                'provider' => $provider->value,
                'plugin_id' => $pluginId,
                'version_id' => $versionId,
                'error' => $e->getMessage(),
            ]);

            throw new DisplayException('Manual download required from ' . $downloadDetails['downloadUrl']);
        }

        return response()->noContent();
    }

    public function getInstalledPluginsVersions(Server $server): array
    {
        $softwareService = new MinecraftSoftwareService();

        return $softwareService->setServer($server)->getInstalledProjectsVersions('plugins');
    }

    public function getMinecraftVersions(Request $request, Server $server): array
    {
        $validated = $request->validate([
            'provider' => ['required', Rule::enum(MinecraftPluginProvider::class)],
        ]);

        $provider = MinecraftPluginProvider::from($validated['provider']);
        $service = $this->getPluginService($provider);

        return $service->getMinecraftVersions();
    }

    public function getPluginLoaders(Request $request, Server $server): array
    {
        $validated = $request->validate([
            'provider' => ['required', Rule::enum(MinecraftPluginProvider::class)],
        ]);

        $provider = MinecraftPluginProvider::from($validated['provider']);
        $service = $this->getPluginService($provider);

        return $service->getPluginLoaders();
    }

    protected function getFileRepository(Server $server): DaemonFileRepository
    {
        $repository = app()->bound(DaemonFileRepository::class)
            ? app(DaemonFileRepository::class)
            : new DaemonFileRepository(app());

        return $repository->setServer($server);
    }

    protected function getPluginService(MinecraftPluginProvider $provider): AbstractPluginService
    {
        return match ($provider) {
            MinecraftPluginProvider::CurseForge => new CurseForgePluginService(
                app()->bound(ExtensionSettingsRegistry::class) ? app(ExtensionSettingsRegistry::class) : null
            ),
            MinecraftPluginProvider::Hangar => new HangarPluginService(),
            MinecraftPluginProvider::Modrinth => new ModrinthPluginService(),
            MinecraftPluginProvider::SpigotMC => new SpigotMCPluginService(),
        };
    }
}
