import React, { useState, useTransition } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ServerContentBlock,
    Spinner,
    httpErrorToHuman,
    useCurrentServerRequired,
    useServerPermission,
} from '@pterodactyl/sdk';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Puzzle,
} from 'lucide-react';
import { searchPlugins, getMinecraftVersions, getPluginLoaders, getInstalledPlugins } from '../api';
import { PluginCard } from '../components/PluginCard';
import { InstallModal } from '../components/InstallModal';
import { PluginDetailsView } from '../components/PluginDetailsView';
import { ManagePluginsView } from '../components/ManagePluginsView';
import type { PluginItem, PluginProvider, PluginSort, SearchFilters } from '../types';

const PROVIDERS: Array<{ value: PluginProvider; label: string }> = [
    { value: 'modrinth', label: 'Modrinth' },
    { value: 'spigotmc', label: 'SpigotMC' },
    { value: 'curseforge', label: 'CurseForge' },
    { value: 'hangar', label: 'Hangar' },
];

const SORT_OPTIONS: Array<{ value: PluginSort; label: string }> = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'downloads', label: 'Downloads' },
    { value: 'updated', label: 'Recently Updated' },
];

export default function PluginsScreen(): React.JSX.Element {
    const server = useCurrentServerRequired();
    const identifier = server.attributes.identifier;
    const canCreateFiles = useServerPermission('file.create');
    const queryClient = useQueryClient();

    const [currentView, setCurrentView] = useState<'browse' | 'manage'>('browse');
    const [selectedPluginForDetails, setSelectedPluginForDetails] = useState<PluginItem | null>(null);

    const [page, setPage] = useState<number>(1);
    const [, startTransition] = useTransition();

    const [filters, setFilters] = useState<SearchFilters>({
        searchQuery: '',
        provider: 'modrinth',
        minecraftVersion: '',
        pluginLoader: '',
        perPage: 24,
        sort: 'relevance',
    });

    const [searchInput, setSearchInput] = useState<string>('');
    const [selectedPluginForInstall, setSelectedPluginForInstall] = useState<PluginItem | null>(null);
    const [isInstallOpen, setIsInstallOpen] = useState<boolean>(false);

    const {
        data: searchData,
        isLoading: isPluginsLoading,
        isError: isPluginsError,
        error: pluginsError,
    } = useQuery({
        queryKey: ['plugins', identifier, page, filters],
        queryFn: () => searchPlugins(identifier, page, filters),
        enabled: currentView === 'browse' && !selectedPluginForDetails,
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

    const handleOpenInstall = (plugin: PluginItem) => {
        setSelectedPluginForInstall(plugin);
        setIsInstallOpen(true);
    };

    const handleViewDetails = (plugin: PluginItem) => {
        setSelectedPluginForDetails(plugin);
    };

    const plugins = searchData?.data ?? [];
    const pagination = searchData?.meta?.pagination;
    const totalPages = pagination?.total_pages ?? 1;

    return (
        <ServerContentBlock title="Minecraft Plugins">
            <div className="ppi:space-y-6">
                {!canCreateFiles && (
                    <div className="ppi:flex ppi:items-center ppi:gap-2 ppi:rounded-xl ppi:border ppi:border-amber-500/30 ppi:bg-amber-500/10 ppi:p-4 ppi:text-sm ppi:text-amber-300">
                        <AlertCircle className="ppi:h-5 ppi:w-5 ppi:shrink-0 ppi:text-amber-400" />
                        <span>You have read-only access. You can browse plugins, but installing them requires file creation permission.</span>
                    </div>
                )}

                <div className="ppi:flex ppi:justify-center">
                    <div className="ppi:flex ppi:w-full ppi:max-w-md ppi:items-center ppi:gap-1 ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/90 ppi:p-1.5 ppi:shadow-sm">
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentView('browse');
                                setSelectedPluginForDetails(null);
                            }}
                            className={`ppi:flex ppi:flex-1 ppi:items-center ppi:justify-center ppi:gap-2 ppi:rounded-xl ppi:py-2 ppi:text-xs sm:ppi:text-sm ppi:font-medium ppi:transition-all ${
                                currentView === 'browse'
                                    ? 'ppi:bg-blue-600/20 ppi:text-blue-400 ppi:shadow-sm'
                                    : 'ppi:text-neutral-400 hover:ppi:text-white hover:ppi:bg-neutral-800/60'
                            }`}
                        >
                            <Search className="ppi:h-4 ppi:w-4" />
                            <span>Browse Plugins</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setCurrentView('manage');
                                setSelectedPluginForDetails(null);
                            }}
                            className={`ppi:flex ppi:flex-1 ppi:items-center ppi:justify-center ppi:gap-2 ppi:rounded-xl ppi:py-2 ppi:text-xs sm:ppi:text-sm ppi:font-medium ppi:transition-all ${
                                currentView === 'manage'
                                    ? 'ppi:bg-blue-600/20 ppi:text-blue-400 ppi:shadow-sm'
                                    : 'ppi:text-neutral-400 hover:ppi:text-white hover:ppi:bg-neutral-800/60'
                            }`}
                        >
                            <Puzzle className="ppi:h-4 ppi:w-4" />
                            <span>Manage Plugins</span>
                        </button>
                    </div>
                </div>

                {currentView === 'manage' ? (
                    <ManagePluginsView
                        serverIdentifier={identifier}
                        onBrowseClick={() => setCurrentView('browse')}
                    />
                ) : selectedPluginForDetails ? (
                    <PluginDetailsView
                        plugin={selectedPluginForDetails}
                        serverIdentifier={identifier}
                        provider={filters.provider}
                        onBack={() => setSelectedPluginForDetails(null)}
                        onInstalled={() => {
                            queryClient.invalidateQueries({ queryKey: ['installed-plugins', identifier] });
                            queryClient.invalidateQueries({ queryKey: ['installed-plugin-files', identifier] });
                        }}
                    />
                ) : (
                    <div className="ppi:space-y-6">
                        <div className="ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/90 ppi:p-4 ppi:shadow-sm">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="ppi:grid ppi:grid-cols-2 ppi:gap-3 sm:ppi:grid-cols-3 lg:ppi:grid-cols-6"
                            >
                                <div>
                                    <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400 ppi:mb-1.5">
                                        Provider
                                    </label>
                                    <select
                                        value={filters.provider}
                                        onChange={(e) => handleProviderChange(e.target.value as PluginProvider)}
                                        style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                        className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-900/90 ppi:px-2.5 ppi:py-2 ppi:text-xs ppi:text-white ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                                    >
                                        {PROVIDERS.map((prov) => (
                                            <option
                                                key={prov.value}
                                                value={prov.value}
                                                style={{ backgroundColor: '#171717', color: '#ffffff' }}
                                                className="ppi:bg-neutral-900 ppi:text-white"
                                            >
                                                {prov.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400 ppi:mb-1.5">
                                        Size
                                    </label>
                                    <select
                                        value={filters.perPage}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setFilters((prev) => ({ ...prev, perPage: val }));
                                            setPage(1);
                                        }}
                                        style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                        className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-900/90 ppi:px-2.5 ppi:py-2 ppi:text-xs ppi:text-white ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                                    >
                                        <option value={12} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">12</option>
                                        <option value={24} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">24</option>
                                        <option value={36} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">36</option>
                                        <option value={48} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">48</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400 ppi:mb-1.5">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sort}
                                        onChange={(e) => {
                                            const val = e.target.value as PluginSort;
                                            setFilters((prev) => ({ ...prev, sort: val }));
                                            setPage(1);
                                        }}
                                        style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                        className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-900/90 ppi:px-2.5 ppi:py-2 ppi:text-xs ppi:text-white ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                                    >
                                        {SORT_OPTIONS.map((opt) => (
                                            <option
                                                key={opt.value}
                                                value={opt.value}
                                                style={{ backgroundColor: '#171717', color: '#ffffff' }}
                                                className="ppi:bg-neutral-900 ppi:text-white"
                                            >
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400 ppi:mb-1.5">
                                        Loader
                                    </label>
                                    <select
                                        value={filters.pluginLoader}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFilters((prev) => ({ ...prev, pluginLoader: val }));
                                            setPage(1);
                                        }}
                                        style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                        className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-900/90 ppi:px-2.5 ppi:py-2 ppi:text-xs ppi:text-white ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                                    >
                                        <option value="" style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">
                                            All Loaders
                                        </option>
                                        {loaders.map((loader) => (
                                            <option
                                                key={loader}
                                                value={loader}
                                                style={{ backgroundColor: '#171717', color: '#ffffff' }}
                                                className="ppi:bg-neutral-900 ppi:text-white"
                                            >
                                                {loader}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400 ppi:mb-1.5">
                                        Version
                                    </label>
                                    <select
                                        value={filters.minecraftVersion}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFilters((prev) => ({ ...prev, minecraftVersion: val }));
                                            setPage(1);
                                        }}
                                        style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                        className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-900/90 ppi:px-2.5 ppi:py-2 ppi:text-xs ppi:text-white ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                                    >
                                        <option value="" style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">
                                            All Versions
                                        </option>
                                        {mcVersions.map((version) => (
                                            <option
                                                key={version}
                                                value={version}
                                                style={{ backgroundColor: '#171717', color: '#ffffff' }}
                                                className="ppi:bg-neutral-900 ppi:text-white"
                                            >
                                                {version}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="ppi:col-span-2 sm:ppi:col-span-1 lg:ppi:col-span-1">
                                    <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400 ppi:mb-1.5">
                                        Search
                                    </label>
                                    <div className="ppi:relative">
                                        <input
                                            type="text"
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            placeholder="Search plugins..."
                                            className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-900/90 ppi:py-2 ppi:pl-8 ppi:pr-3 ppi:text-xs ppi:text-white ppi:placeholder-neutral-500 ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                                        />
                                        <Search className="ppi:absolute ppi:left-2.5 ppi:top-2.5 ppi:h-3.5 ppi:w-3.5 ppi:text-neutral-500" />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {isPluginsLoading ? (
                            <div className="ppi:flex ppi:h-64 ppi:items-center ppi:justify-center">
                                <Spinner centered />
                            </div>
                        ) : isPluginsError ? (
                            <div className="ppi:rounded-2xl ppi:border ppi:border-red-500/30 ppi:bg-red-500/10 ppi:p-6 ppi:text-center">
                                <AlertCircle className="ppi:mx-auto ppi:h-8 ppi:w-8 ppi:text-red-400" />
                                <h3 className="ppi:mt-2 ppi:font-semibold ppi:text-white">Failed to load plugins</h3>
                                <p className="ppi:mt-1 ppi:text-xs ppi:text-neutral-400">{httpErrorToHuman(pluginsError)}</p>
                            </div>
                        ) : plugins.length === 0 ? (
                            <div className="ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/80 ppi:p-12 ppi:text-center">
                                <Search className="ppi:mx-auto ppi:h-10 ppi:w-10 ppi:text-neutral-500" />
                                <h3 className="ppi:mt-3 ppi:font-semibold ppi:text-white">No plugins found</h3>
                                <p className="ppi:mt-1 ppi:text-xs ppi:text-neutral-400">
                                    Try adjusting your search keywords, version, or provider filters.
                                </p>
                            </div>
                        ) : (
                            <div className="ppi:grid ppi:grid-cols-1 ppi:gap-4 md:ppi:grid-cols-2 lg:ppi:grid-cols-3">
                                {plugins.map((plugin) => (
                                    <PluginCard
                                        key={plugin.id}
                                        plugin={plugin}
                                        onViewDetails={handleViewDetails}
                                        onInstall={handleOpenInstall}
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="ppi:flex ppi:items-center ppi:justify-between ppi:border-t ppi:border-neutral-800 ppi:pt-4">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-xl ppi:border ppi:border-neutral-700/70 ppi:bg-neutral-800/80 ppi:px-4 ppi:py-2 ppi:text-xs ppi:font-medium ppi:text-neutral-300 hover:ppi:bg-neutral-700 hover:ppi:text-white ppi:transition-colors disabled:ppi:opacity-40"
                                >
                                    <ChevronLeft className="ppi:h-4 ppi:w-4" />
                                    <span>Previous</span>
                                </button>

                                <span className="ppi:text-xs ppi:text-neutral-400">
                                    Page <strong className="ppi:text-white">{page}</strong> of <strong className="ppi:text-white">{totalPages}</strong>
                                </span>

                                <button
                                    type="button"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-xl ppi:border ppi:border-neutral-700/70 ppi:bg-neutral-800/80 ppi:px-4 ppi:py-2 ppi:text-xs ppi:font-medium ppi:text-neutral-300 hover:ppi:bg-neutral-700 hover:ppi:text-white ppi:transition-colors disabled:ppi:opacity-40"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="ppi:h-4 ppi:w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <InstallModal
                open={isInstallOpen}
                onClose={() => {
                    setIsInstallOpen(false);
                    setSelectedPluginForInstall(null);
                }}
                plugin={selectedPluginForInstall}
                serverIdentifier={identifier}
                provider={filters.provider}
                minecraftVersion={filters.minecraftVersion}
                pluginLoader={filters.pluginLoader}
                onInstalled={() => {
                    queryClient.invalidateQueries({ queryKey: ['installed-plugins', identifier] });
                    queryClient.invalidateQueries({ queryKey: ['installed-plugin-files', identifier] });
                }}
            />
        </ServerContentBlock>
    );
}
