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
            <div className="ppi:space-y-6">
                <div className="ppi:flex ppi:flex-col ppi:gap-4 md:ppi:flex-row md:ppi:items-center md:ppi:justify-between">
                    <div>
                        <h1 className="ppi:text-2xl ppi:font-bold ppi:text-white">Ptrodactyl Plugin Installer</h1>
                        <p className="ppi:text-sm ppi:text-neutral-400">
                            Search and install plugins from Modrinth, SpigotMC, CurseForge, and Hangar.
                        </p>
                    </div>

                    <div className="ppi:flex ppi:items-center ppi:gap-2">
                        <span className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:bg-neutral-800/80 ppi:px-3 ppi:py-1.5 ppi:text-xs ppi:text-neutral-300">
                            <CheckCircle2 className="ppi:h-4 ppi:w-4 ppi:text-green-400" />
                            <span>Installed in /plugins: <strong className="ppi:text-white">{totalInstalledCount}</strong></span>
                        </span>
                    </div>
                </div>

                {!canCreateFiles && (
                    <div className="ppi:flex ppi:items-center ppi:gap-2 ppi:rounded-xl ppi:border ppi:border-amber-500/30 ppi:bg-amber-500/10 ppi:p-4 ppi:text-sm ppi:text-amber-300">
                        <AlertCircle className="ppi:h-5 ppi:w-5 ppi:shrink-0 ppi:text-amber-400" />
                        <span>You have read-only access. You can browse plugins, but installing them requires file creation permission.</span>
                    </div>
                )}

                <div className="ppi:flex ppi:flex-wrap ppi:gap-2 ppi:border-b ppi:border-neutral-800 ppi:pb-4">
                    {PROVIDERS.map((prov) => {
                        const isActive = filters.provider === prov.value;
                        return (
                            <button
                                key={prov.value}
                                type="button"
                                onClick={() => handleProviderChange(prov.value)}
                                className={`ppi:rounded-lg ppi:px-4 ppi:py-2 ppi:text-sm ppi:font-medium ppi:transition-all ${
                                    isActive
                                        ? 'ppi:bg-blue-600 ppi:text-white ppi:shadow-sm'
                                        : 'ppi:bg-neutral-800/80 ppi:text-neutral-300 hover:ppi:bg-neutral-700 hover:ppi:text-white'
                                }`}
                            >
                                {prov.label}
                            </button>
                        );
                    })}
                </div>

                <div className="ppi:grid ppi:grid-cols-1 ppi:gap-3 sm:ppi:grid-cols-2 md:ppi:grid-cols-12">
                    <form onSubmit={handleSearchSubmit} className="md:ppi:col-span-5 ppi:relative">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search plugins by name, keyword, or author..."
                            className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:bg-neutral-900 ppi:py-2.5 ppi:pl-10 ppi:pr-4 ppi:text-sm ppi:text-white ppi:placeholder-neutral-500 ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                        />
                        <Search className="ppi:absolute ppi:left-3 ppi:top-3 ppi:h-4 ppi:w-4 ppi:text-neutral-500" />
                    </form>

                    <div className="md:ppi:col-span-3">
                        <select
                            value={filters.minecraftVersion}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFilters((prev) => ({ ...prev, minecraftVersion: val }));
                                setPage(1);
                            }}
                            style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                            className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:bg-neutral-900 ppi:px-3 ppi:py-2.5 ppi:text-sm ppi:text-white ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                        >
                            <option value="" style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">
                                All MC Versions
                            </option>
                            {mcVersions.map((version) => (
                                <option key={version} value={version} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">
                                    MC {version}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loaders.length > 0 && (
                        <div className="md:ppi:col-span-2">
                            <select
                                value={filters.pluginLoader}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFilters((prev) => ({ ...prev, pluginLoader: val }));
                                    setPage(1);
                                }}
                                style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:bg-neutral-900 ppi:px-3 ppi:py-2.5 ppi:text-sm ppi:text-white ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                            >
                                <option value="" style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">
                                    All Loaders
                                </option>
                                {loaders.map((loader) => (
                                    <option key={loader} value={loader} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">
                                        {loader}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className={loaders.length > 0 ? 'md:ppi:col-span-2' : 'md:ppi:col-span-4'}>
                        <div className="ppi:flex ppi:items-center ppi:gap-2">
                            <SlidersHorizontal className="ppi:h-4 ppi:w-4 ppi:text-neutral-500 ppi:shrink-0" />
                            <select
                                value={filters.sort}
                                onChange={(e) => {
                                    const val = e.target.value as PluginSort;
                                    setFilters((prev) => ({ ...prev, sort: val }));
                                    setPage(1);
                                }}
                                style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:bg-neutral-900 ppi:px-3 ppi:py-2.5 ppi:text-sm ppi:text-white ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {isPluginsLoading ? (
                    <div className="ppi:flex ppi:h-64 ppi:items-center ppi:justify-center">
                        <Spinner centered />
                    </div>
                ) : isPluginsError ? (
                    <div className="ppi:rounded-xl ppi:border ppi:border-red-500/30 ppi:bg-red-500/10 ppi:p-6 ppi:text-center">
                        <AlertCircle className="ppi:mx-auto ppi:h-8 ppi:w-8 ppi:text-red-400" />
                        <h3 className="ppi:mt-2 ppi:font-semibold ppi:text-white">Failed to load plugins</h3>
                        <p className="ppi:mt-1 ppi:text-sm ppi:text-red-300">{httpErrorToHuman(pluginsError)}</p>
                    </div>
                ) : plugins.length === 0 ? (
                    <div className="ppi:rounded-2xl ppi:border ppi:border-neutral-800 ppi:bg-neutral-900/50 ppi:p-12 ppi:text-center">
                        <Search className="ppi:mx-auto ppi:h-12 ppi:w-12 ppi:text-neutral-600" />
                        <h3 className="ppi:mt-3 ppi:text-base ppi:font-semibold ppi:text-neutral-200">No plugins found</h3>
                        <p className="ppi:mt-1 ppi:text-sm ppi:text-neutral-400">
                            Try adjusting your search terms or clearing the version filters.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="ppi:grid ppi:grid-cols-1 ppi:gap-4 sm:ppi:grid-cols-2 lg:ppi:grid-cols-3">
                            {plugins.map((plugin) => (
                                <PluginCard
                                    key={`${filters.provider}-${plugin.id}`}
                                    plugin={plugin}
                                    onSelect={handleSelectPlugin}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="ppi:flex ppi:items-center ppi:justify-between ppi:border-t ppi:border-neutral-800 ppi:pt-4">
                                <div className="ppi:flex ppi:items-center ppi:gap-3">
                                    <span className="ppi:text-xs ppi:text-neutral-400">
                                        Page <strong className="ppi:text-white">{page}</strong> of{' '}
                                        <strong className="ppi:text-white">{totalPages}</strong> ({pagination?.total ?? 0} total)
                                    </span>

                                    <select
                                        value={String(filters.perPage)}
                                        onChange={(e) => {
                                            const newSize = Number(e.target.value);
                                            setFilters((prev) => ({ ...prev, perPage: newSize }));
                                            setPage(1);
                                        }}
                                        className="ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:bg-neutral-800 ppi:px-2.5 ppi:py-1 ppi:text-xs ppi:text-neutral-200 ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="ppi:flex ppi:items-center ppi:gap-2">
                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        className="ppi:flex ppi:items-center ppi:gap-1 ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:bg-neutral-800 ppi:px-3 ppi:py-1.5 ppi:text-xs ppi:font-medium ppi:text-neutral-200 hover:ppi:bg-neutral-700 disabled:ppi:opacity-40 disabled:ppi:pointer-events-none"
                                    >
                                        <ChevronLeft className="ppi:h-4 ppi:w-4" />
                                        <span>Previous</span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        className="ppi:flex ppi:items-center ppi:gap-1 ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:bg-neutral-800 ppi:px-3 ppi:py-1.5 ppi:text-xs ppi:font-medium ppi:text-neutral-200 hover:ppi:bg-neutral-700 disabled:ppi:opacity-40 disabled:ppi:pointer-events-none"
                                    >
                                        <span>Next</span>
                                        <ChevronRight className="ppi:h-4 ppi:w-4" />
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
