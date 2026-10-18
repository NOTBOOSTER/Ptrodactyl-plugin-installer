import React, { useState, useTransition } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ServerContentBlock,
    Spinner,
    httpErrorToHuman,
    useCurrentServerRequired,
    useServerPermission,
} from '@pterodactyl/sdk';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { searchPlugins, getMinecraftVersions, getPluginLoaders, getInstalledPlugins } from '../api';
import { PluginCard } from '../components/PluginCard';
import { InstallModal } from '../components/InstallModal';
import type { FilterOption, PluginItem, PluginProvider, PluginSort, SearchFilters } from '../types';

const PROVIDERS: Array<{ value: PluginProvider; label: string }> = [
    { value: 'modrinth', label: 'Modrinth' },
    { value: 'spigotmc', label: 'SpigotMC' },
    { value: 'curseforge', label: 'CurseForge' },
    { value: 'hangar', label: 'Hangar' },
];

const SORT_OPTIONS: Array<{ value: PluginSort; label: string }> = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'downloads', label: 'Most Downloads' },
    { value: 'updated', label: 'Recently Updated' },
];

const PAGE_SIZE_OPTIONS: FilterOption[] = [
    { value: '12', label: '12 per page' },
    { value: '24', label: '24 per page' },
    { value: '36', label: '36 per page' },
];

export default function PluginsScreen(): React.JSX.Element {
    const server = useCurrentServerRequired();
    const identifier = server.attributes.identifier;
    const canCreateFiles = useServerPermission('file.create');
    const queryClient = useQueryClient();

    const [page, setPage] = useState<number>(1);
    const [, startTransition] = useTransition();

    const [filters, setFilters] = useState<SearchFilters>({
        searchQuery: '',
        provider: 'modrinth',
        minecraftVersion: '',
        pluginLoader: '',
        perPage: 12,
        sort: 'relevance',
    });

    const [searchInput, setSearchInput] = useState<string>('');
    const [selectedPlugin, setSelectedPlugin] = useState<PluginItem | null>(null);
    const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);

    const {
        data: searchData,
        isLoading: isPluginsLoading,
        isError: isPluginsError,
        error: pluginsError,
    } = useQuery({
        queryKey: ['plugins', identifier, page, filters],
        queryFn: () => searchPlugins(identifier, page, filters),
    });

    const { data: mcVersions = [] } = useQuery({
        queryKey: ['mc-versions', identifier, filters.provider],
        queryFn: () => getMinecraftVersions(identifier, filters.provider),
    });

    const { data: loaders = [] } = useQuery({
        queryKey: ['plugin-loaders', identifier, filters.provider],
        queryFn: () => getPluginLoaders(identifier, filters.provider),
        enabled: filters.provider === 'modrinth' || filters.provider === 'hangar',
    });

    const { data: installedData } = useQuery({
        queryKey: ['installed-plugins', identifier],
        queryFn: () => getInstalledPlugins(identifier),
    });

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        startTransition(() => {
            setFilters((prev) => ({ ...prev, searchQuery: searchInput }));
            setPage(1);
        });
    };

    const handleProviderChange = (newProvider: PluginProvider) => {
        startTransition(() => {
            setFilters((prev) => ({
                ...prev,
                provider: newProvider,
                minecraftVersion: '',
                pluginLoader: '',
            }));
            setPage(1);
        });
    };

    const handleSelectPlugin = (plugin: PluginItem) => {
        setSelectedPlugin(plugin);
        setIsInstallOpen(true);
    };

    const plugins = searchData?.data ?? [];
    const pagination = searchData?.meta?.pagination;
    const totalPages = pagination?.total_pages ?? 1;
    const totalInstalledCount = (installedData?.identified?.length ?? 0) + (installedData?.other?.length ?? 0);

    return (
        <ServerContentBlock title="Minecraft Plugins">
            <div className="mpi:space-y-6">
                <div className="mpi:flex mpi:flex-col mpi:gap-4 md:mpi:flex-row md:mpi:items-center md:mpi:justify-between">
                    <div>
                        <h1 className="mpi:text-2xl mpi:font-bold mpi:text-white">Minecraft Plugin Installer</h1>
                        <p className="mpi:text-sm mpi:text-neutral-400">
                            Search and install plugins from Modrinth, SpigotMC, CurseForge, and Hangar.
                        </p>
                    </div>

                    <div className="mpi:flex mpi:items-center mpi:gap-2">
                        <span className="mpi:flex mpi:items-center mpi:gap-1.5 mpi:rounded-lg mpi:border mpi:border-neutral-700 mpi:bg-neutral-800/80 mpi:px-3 mpi:py-1.5 mpi:text-xs mpi:text-neutral-300">
                            <CheckCircle2 className="mpi:h-4 mpi:w-4 mpi:text-green-400" />
                            <span>Installed in /plugins: <strong className="mpi:text-white">{totalInstalledCount}</strong></span>
                        </span>
                    </div>
                </div>

                {!canCreateFiles && (
                    <div className="mpi:flex mpi:items-center mpi:gap-2 mpi:rounded-xl mpi:border mpi:border-amber-500/30 mpi:bg-amber-500/10 mpi:p-4 mpi:text-sm mpi:text-amber-300">
                        <AlertCircle className="mpi:h-5 mpi:w-5 mpi:shrink-0 text-amber-400" />
                        <span>You have read-only access. You can browse plugins, but installing them requires file creation permission.</span>
                    </div>
                )}

                <div className="mpi:flex mpi:flex-wrap mpi:gap-2 mpi:border-b mpi:border-neutral-800 mpi:pb-4">
                    {PROVIDERS.map((prov) => {
                        const isActive = filters.provider === prov.value;
                        return (
                            <button
                                key={prov.value}
                                type="button"
                                onClick={() => handleProviderChange(prov.value)}
                                className={`mpi:rounded-lg mpi:px-4 mpi:py-2 mpi:text-sm mpi:font-medium mpi:transition-all ${
                                    isActive
                                        ? 'mpi:bg-blue-600 mpi:text-white mpi:shadow-sm'
                                        : 'mpi:bg-neutral-800/80 mpi:text-neutral-300 hover:mpi:bg-neutral-700 hover:mpi:text-white'
                                }`}
                            >
                                {prov.label}
                            </button>
                        );
                    })}
                </div>

                <div className="mpi:grid mpi:grid-cols-1 mpi:gap-3 sm:mpi:grid-cols-2 md:mpi:grid-cols-12">
                    <form onSubmit={handleSearchSubmit} className="md:mpi:col-span-5 mpi:relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search plugins by name, keyword, or author..."
                            className="mpi:w-full mpi:rounded-lg mpi:border mpi:border-neutral-700 mpi:bg-neutral-900 mpi:py-2.5 mpi:pl-10 mpi:pr-4 mpi:text-sm mpi:text-white mpi:placeholder-neutral-500 mpi:outline-none hover:mpi:border-neutral-600 focus:mpi:border-blue-500"
                        />
                        <Search className="mpi:absolute mpi:left-3 mpi:top-3 mpi:h-4 mpi:w-4 mpi:text-neutral-500" />
                    </form>

                    <div className="md:mpi:col-span-3">
                        <select
                            value={filters.minecraftVersion}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFilters((prev) => ({ ...prev, minecraftVersion: val }));
                                setPage(1);
                            }}
                            className="mpi:w-full mpi:rounded-lg mpi:border mpi:border-neutral-700 mpi:bg-neutral-900 mpi:px-3 mpi:py-2.5 mpi:text-sm mpi:text-white mpi:outline-none hover:mpi:border-neutral-600 focus:mpi:border-blue-500"
                        >
                            <option value="">All MC Versions</option>
                            {mcVersions.map((version) => (
                                <option key={version} value={version}>
                                    MC {version}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loaders.length > 0 && (
                        <div className="md:mpi:col-span-2">
                            <select
                                value={filters.pluginLoader}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFilters((prev) => ({ ...prev, pluginLoader: val }));
                                    setPage(1);
                                }}
                                className="mpi:w-full mpi:rounded-lg mpi:border mpi:border-neutral-700 mpi:bg-neutral-900 mpi:px-3 mpi:py-2.5 mpi:text-sm mpi:text-white mpi:outline-none hover:mpi:border-neutral-600 focus:mpi:border-blue-500"
                            >
                                <option value="">All Loaders</option>
                                {loaders.map((loader) => (
                                    <option key={loader} value={loader}>
                                        {loader}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className={loaders.length > 0 ? 'md:mpi:col-span-2' : 'md:mpi:col-span-4'}>
                        <div className="mpi:flex mpi:items-center mpi:gap-2">
                            <SlidersHorizontal className="mpi:h-4 mpi:w-4 mpi:text-neutral-500 mpi:shrink-0" />
                            <select
                                value={filters.sort}
                                onChange={(e) => {
                                    const val = e.target.value as PluginSort;
                                    setFilters((prev) => ({ ...prev, sort: val }));
                                    setPage(1);
                                }}
                                className="mpi:w-full mpi:rounded-lg mpi:border mpi:border-neutral-700 mpi:bg-neutral-900 mpi:px-3 mpi:py-2.5 mpi:text-sm mpi:text-white mpi:outline-none hover:mpi:border-neutral-600 focus:mpi:border-blue-500"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {isPluginsLoading ? (
                    <div className="mpi:flex mpi:h-64 mpi:items-center mpi:justify-center">
                        <Spinner centered />
                    </div>
                ) : isPluginsError ? (
                    <div className="mpi:rounded-xl mpi:border mpi:border-red-500/30 mpi:bg-red-500/10 mpi:p-6 mpi:text-center">
                        <AlertCircle className="mpi:mx-auto mpi:h-8 mpi:w-8 mpi:text-red-400" />
                        <h3 className="mpi:mt-2 mpi:font-semibold mpi:text-white">Failed to load plugins</h3>
                        <p className="mpi:mt-1 mpi:text-sm mpi:text-red-300">{httpErrorToHuman(pluginsError)}</p>
                    </div>
                ) : plugins.length === 0 ? (
                    <div className="mpi:rounded-2xl mpi:border mpi:border-neutral-800 mpi:bg-neutral-900/50 mpi:p-12 mpi:text-center">
                        <Search className="mpi:mx-auto mpi:h-12 mpi:w-12 mpi:text-neutral-600" />
                        <h3 className="mpi:mt-3 mpi:text-base mpi:font-semibold mpi:text-neutral-200">No plugins found</h3>
                        <p className="mpi:mt-1 mpi:text-sm mpi:text-neutral-400">
                            Try adjusting your search terms or clearing the version filters.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mpi:grid mpi:grid-cols-1 mpi:gap-4 sm:mpi:grid-cols-2 lg:mpi:grid-cols-3">
                            {plugins.map((plugin) => (
                                <PluginCard
                                    key={`${filters.provider}-${plugin.id}`}
                                    plugin={plugin}
                                    onSelect={handleSelectPlugin}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mpi:flex mpi:items-center mpi:justify-between mpi:border-t mpi:border-neutral-800 mpi:pt-4">
                                <div className="mpi:flex mpi:items-center mpi:gap-3">
                                    <span className="mpi:text-xs mpi:text-neutral-400">
                                        Page <strong className="mpi:text-white">{page}</strong> of{' '}
                                        <strong className="mpi:text-white">{totalPages}</strong> ({pagination?.total ?? 0} total)
                                    </span>

                                    <select
                                        value={String(filters.perPage)}
                                        onChange={(e) => {
                                            const newSize = Number(e.target.value);
                                            setFilters((prev) => ({ ...prev, perPage: newSize }));
                                            setPage(1);
                                        }}
                                        className="mpi:rounded-lg mpi:border mpi:border-neutral-700 mpi:bg-neutral-800 mpi:px-2.5 mpi:py-1 mpi:text-xs mpi:text-neutral-200 mpi:outline-none hover:mpi:border-neutral-600 focus:mpi:border-blue-500"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mpi:flex mpi:items-center mpi:gap-2">
                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className="mpi:flex mpi:items-center mpi:gap-1 mpi:rounded-lg mpi:border mpi:border-neutral-700 mpi:bg-neutral-800 mpi:px-3 mpi:py-1.5 mpi:text-xs mpi:font-medium mpi:text-neutral-200 hover:mpi:bg-neutral-700 disabled:mpi:opacity-40 disabled:mpi:pointer-events-none"
                                    >
                                        <ChevronLeft className="mpi:h-4 mpi:w-4" />
                                        <span>Previous</span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        className="mpi:flex mpi:items-center mpi:gap-1 mpi:rounded-lg mpi:border mpi:border-neutral-700 mpi:bg-neutral-800 mpi:px-3 mpi:py-1.5 mpi:text-xs mpi:font-medium mpi:text-neutral-200 hover:mpi:bg-neutral-700 disabled:mpi:opacity-40 disabled:mpi:pointer-events-none"
                                    >
                                        <span>Next</span>
                                        <ChevronRight className="mpi:h-4 mpi:w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <InstallModal
                open={isInstallOpen}
                onClose={() => {
                    setIsInstallOpen(false);
                    setSelectedPlugin(null);
                }}
                plugin={selectedPlugin}
                serverIdentifier={identifier}
                provider={filters.provider}
                minecraftVersion={filters.minecraftVersion}
                pluginLoader={filters.pluginLoader}
                onInstalled={() => {
                    queryClient.invalidateQueries({ queryKey: ['installed-plugins', identifier] });
                }}
            />
        </ServerContentBlock>
    );
}
