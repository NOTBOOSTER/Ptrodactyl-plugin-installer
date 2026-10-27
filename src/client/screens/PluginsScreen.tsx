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
import { searchPlugins, getMinecraftVersions, getPluginLoaders } from '../api';
import { PluginCard } from '../components/PluginCard';
import { PluginDetailsModal } from '../components/PluginDetailsModal';
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
    const [activeModalPlugin, setActiveModalPlugin] = useState<PluginItem | null>(null);

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

    const {
        data: searchData,
        isLoading: isPluginsLoading,
        isError: isPluginsError,
        error: pluginsError,
    } = useQuery({
        queryKey: ['plugins', identifier, page, filters],
        queryFn: () => searchPlugins(identifier, page, filters),
        enabled: currentView === 'browse',
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
            setFilters((prev: SearchFilters) => ({ ...prev, searchQuery: searchInput }));
            setPage(1);
        });
    };

    const handleProviderChange = (newProvider: PluginProvider) => {
        startTransition(() => {
            setFilters((prev: SearchFilters) => ({
                ...prev,
                provider: newProvider,
                minecraftVersion: '',
                pluginLoader: '',
            }));
            setPage(1);
        });
    };

    const plugins: PluginItem[] = searchData?.data ?? [];
    const pagination = searchData?.meta?.pagination;
    const totalPages: number = pagination?.total_pages ?? 1;

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
                    <div className="ppi:inline-flex ppi:items-center ppi:rounded-full ppi:border ppi:border-slate-700/80 ppi:bg-[#202936] ppi:p-1.5 ppi:shadow-sm">
                        <button
                            type="button"
                            onClick={() => setCurrentView('browse')}
                            className={`ppi:flex ppi:items-center ppi:gap-2 ppi:rounded-full ppi:px-6 ppi:py-2 ppi:text-xs sm:ppi:text-sm ppi:font-semibold ppi:transition-all ${
                                currentView === 'browse'
                                    ? 'ppi:bg-blue-600 ppi:text-white ppi:shadow-md'
                                    : 'ppi:text-slate-400 hover:ppi:text-white hover:ppi:bg-slate-700/50'
                            }`}
                        >
                            <Search className="ppi:h-4 ppi:w-4" />
                            <span>Browse Plugins</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setCurrentView('manage')}
                            className={`ppi:flex ppi:items-center ppi:gap-2 ppi:rounded-full ppi:px-6 ppi:py-2 ppi:text-xs sm:ppi:text-sm ppi:font-semibold ppi:transition-all ${
                                currentView === 'manage'
                                    ? 'ppi:bg-blue-600 ppi:text-white ppi:shadow-md'
                                    : 'ppi:text-slate-400 hover:ppi:text-white hover:ppi:bg-slate-700/50'
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
                ) : (
                    <div className="ppi:space-y-6">
                        <div className="ppi:rounded-2xl ppi:border ppi:border-slate-700/70 ppi:bg-[#202936] ppi:p-4.5 ppi:shadow-sm">
                            <form onSubmit={handleSearchSubmit} className="ppi:space-y-3.5">
                                <div className="ppi:grid ppi:grid-cols-12 ppi:gap-3.5">
                                    <div className="ppi:col-span-12 lg:ppi:col-span-6">
                                        <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-slate-400 ppi:mb-1.5">
                                            Search Plugins
                                        </label>
                                        <div className="ppi:relative">
                                            <input
                                                type="text"
                                                value={searchInput}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
                                                placeholder="Search by name, tag, or author..."
                                                className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-slate-700 ppi:bg-slate-900/90 ppi:py-2.5 ppi:pl-9 ppi:pr-3 ppi:text-xs ppi:text-white ppi:placeholder-slate-500 ppi:outline-none hover:ppi:border-slate-600 focus:ppi:border-blue-500"
                                            />
                                            <Search className="ppi:absolute ppi:left-3 ppi:top-3 ppi:h-3.5 ppi:w-3.5 ppi:text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="ppi:col-span-6 lg:ppi:col-span-3">
                                        <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-slate-400 ppi:mb-1.5">
                                            Provider
                                        </label>
                                        <select
                                            value={filters.provider}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleProviderChange(e.target.value as PluginProvider)}
                                            style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                            className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-slate-700 ppi:bg-slate-900/90 ppi:px-3 ppi:py-2.5 ppi:text-xs ppi:text-white ppi:outline-none hover:ppi:border-slate-600 focus:ppi:border-blue-500"
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

                                    <div className="ppi:col-span-6 lg:ppi:col-span-3">
                                        <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-slate-400 ppi:mb-1.5">
                                            Sort By
                                        </label>
                                        <select
                                            value={filters.sort}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                const val = e.target.value as PluginSort;
                                                setFilters((prev: SearchFilters) => ({ ...prev, sort: val }));
                                                setPage(1);
                                            }}
                                            style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                            className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-slate-700 ppi:bg-slate-900/90 ppi:px-3 ppi:py-2.5 ppi:text-xs ppi:text-white ppi:outline-none hover:ppi:border-slate-600 focus:ppi:border-blue-500"
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
                                </div>

                                <div className="ppi:grid ppi:grid-cols-12 ppi:gap-3.5">
                                    <div className="ppi:col-span-6 lg:ppi:col-span-4">
                                        <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-slate-400 ppi:mb-1.5">
                                            Loader
                                        </label>
                                        <select
                                            value={filters.pluginLoader}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                const val = e.target.value;
                                                setFilters((prev: SearchFilters) => ({ ...prev, pluginLoader: val }));
                                                setPage(1);
                                            }}
                                            style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                            className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-slate-700 ppi:bg-slate-900/90 ppi:px-3 ppi:py-2.5 ppi:text-xs ppi:text-white ppi:outline-none hover:ppi:border-slate-600 focus:ppi:border-blue-500"
                                        >
                                            <option value="" style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">
                                                All Loaders
                                            </option>
                                            {loaders.map((loader: string) => (
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

                                    <div className="ppi:col-span-6 lg:ppi:col-span-4">
                                        <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-slate-400 ppi:mb-1.5">
                                            Minecraft Version
                                        </label>
                                        <select
                                            value={filters.minecraftVersion}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                const val = e.target.value;
                                                setFilters((prev: SearchFilters) => ({ ...prev, minecraftVersion: val }));
                                                setPage(1);
                                            }}
                                            style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                            className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-slate-700 ppi:bg-slate-900/90 ppi:px-3 ppi:py-2.5 ppi:text-xs ppi:text-white ppi:outline-none hover:ppi:border-slate-600 focus:ppi:border-blue-500"
                                        >
                                            <option value="" style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">
                                                All Versions
                                            </option>
                                            {mcVersions.map((version: string) => (
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

                                    <div className="ppi:col-span-12 lg:ppi:col-span-4">
                                        <label className="ppi:block ppi:text-[11px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-slate-400 ppi:mb-1.5">
                                            Per Page
                                        </label>
                                        <select
                                            value={filters.perPage}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                const val = Number(e.target.value);
                                                setFilters((prev: SearchFilters) => ({ ...prev, perPage: val }));
                                                setPage(1);
                                            }}
                                            style={{ backgroundColor: '#171717', color: '#ffffff', colorScheme: 'dark' }}
                                            className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-slate-700 ppi:bg-slate-900/90 ppi:px-3 ppi:py-2.5 ppi:text-xs ppi:text-white ppi:outline-none hover:ppi:border-slate-600 focus:ppi:border-blue-500"
                                        >
                                            <option value={12} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">12 plugins</option>
                                            <option value={24} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">24 plugins</option>
                                            <option value={36} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">36 plugins</option>
                                            <option value={48} style={{ backgroundColor: '#171717', color: '#ffffff' }} className="ppi:bg-neutral-900 ppi:text-white">48 plugins</option>
                                        </select>
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
                                <p className="ppi:mt-1 ppi:text-xs ppi:text-slate-400">{httpErrorToHuman(pluginsError)}</p>
                            </div>
                        ) : plugins.length === 0 ? (
                            <div className="ppi:rounded-2xl ppi:border ppi:border-slate-700/60 ppi:bg-[#202936] ppi:p-12 ppi:text-center">
                                <Search className="ppi:mx-auto ppi:h-10 ppi:w-10 ppi:text-slate-500" />
                                <h3 className="ppi:mt-3 ppi:font-semibold ppi:text-white">No plugins found</h3>
                                <p className="ppi:mt-1 ppi:text-xs ppi:text-slate-400">
                                    Try adjusting your search keywords, version, or provider filters.
                                </p>
                            </div>
                        ) : (
                            <div className="ppi:grid ppi:grid-cols-1 ppi:gap-4 md:ppi:grid-cols-2 lg:ppi:grid-cols-3">
                                {plugins.map((plugin: PluginItem) => (
                                    <PluginCard
                                        key={plugin.id}
                                        plugin={plugin}
                                        onOpenDetails={setActiveModalPlugin}
                                        onInstall={setActiveModalPlugin}
                                    />
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="ppi:flex ppi:items-center ppi:justify-between ppi:border-t ppi:border-slate-700/80 ppi:pt-4">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                                    className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-xl ppi:border ppi:border-slate-700 ppi:bg-[#202936] ppi:px-4 ppi:py-2 ppi:text-xs ppi:font-medium ppi:text-slate-300 hover:ppi:bg-slate-700/70 hover:ppi:text-white ppi:transition-colors disabled:ppi:opacity-40"
                                >
                                    <ChevronLeft className="ppi:h-4 ppi:w-4" />
                                    <span>Previous</span>
                                </button>

                                <span className="ppi:text-xs ppi:text-slate-400">
                                    Page <strong className="ppi:text-white">{page}</strong> of <strong className="ppi:text-white">{totalPages}</strong>
                                </span>

                                <button
                                    type="button"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p: number) => p + 1)}
                                    className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-xl ppi:border ppi:border-slate-700 ppi:bg-[#202936] ppi:px-4 ppi:py-2 ppi:text-xs ppi:font-medium ppi:text-slate-300 hover:ppi:bg-slate-700/70 hover:ppi:text-white ppi:transition-colors disabled:ppi:opacity-40"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="ppi:h-4 ppi:w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PluginDetailsModal
                open={Boolean(activeModalPlugin)}
                onClose={() => setActiveModalPlugin(null)}
                plugin={activeModalPlugin}
                serverIdentifier={identifier}
                provider={filters.provider}
                onInstalled={() => {
                    queryClient.invalidateQueries({ queryKey: ['installed-plugins', identifier] });
                    queryClient.invalidateQueries({ queryKey: ['installed-plugin-files', identifier] });
                }}
            />
        </ServerContentBlock>
    );
}
