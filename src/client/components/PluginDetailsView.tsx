import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Spinner, httpErrorToHuman, toast } from '@pterodactyl/sdk';
import {
    ArrowLeft,
    Download,
    ExternalLink,
    Heart,
    Package,
    Calendar,
    RefreshCw,
    Layers,
    FileText,
    Boxes,
    Check,
} from 'lucide-react';
import { getPluginVersions, installPlugin } from '../api';
import type { PluginItem, PluginProvider, PluginVersionItem } from '../types';

interface PluginDetailsViewProps {
    plugin: PluginItem;
    serverIdentifier: string;
    provider: PluginProvider;
    onBack: () => void;
    onInstalled: () => void;
}

export function PluginDetailsView({
    plugin,
    serverIdentifier,
    provider,
    onBack,
    onInstalled,
}: PluginDetailsViewProps): React.JSX.Element {
    const [activeTab, setActiveTab] = useState<'description' | 'versions'>('versions');
    const [installingVersionId, setInstallingVersionId] = useState<string | null>(null);

    const {
        data: versionData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['plugin-details-versions', serverIdentifier, plugin.id, provider],
        queryFn: () => getPluginVersions(serverIdentifier, plugin.id, provider),
    });

    const project = versionData?.project;
    const versions = versionData?.versions ?? [];

    const installMutation = useMutation({
        mutationFn: async (version: PluginVersionItem) => {
            setInstallingVersionId(version.id);
            await installPlugin(serverIdentifier, plugin.id, version.id, provider);
        },
        onSuccess: (_data, version) => {
            toast.success(`Successfully installed ${plugin.name} (${version.name})`);
            setInstallingVersionId(null);
            onInstalled();
        },
        onError: (err: unknown) => {
            toast.error(httpErrorToHuman(err));
            setInstallingVersionId(null);
        },
    });

    const formattedDownloads = (plugin.downloads ?? project?.downloads) !== undefined
        ? Number(plugin.downloads ?? project?.downloads).toLocaleString()
        : '0';

    const formattedFollowers = (plugin.followers ?? project?.followers) !== undefined && (plugin.followers ?? project?.followers) !== null
        ? Number(plugin.followers ?? project?.followers).toLocaleString()
        : null;

    const allLoaders = Array.from(
        new Set(versions.flatMap((v) => v.platforms ?? []).filter(Boolean))
    );

    const allGameVersions = Array.from(
        new Set(versions.flatMap((v) => v.game_versions ?? []).filter(Boolean))
    );

    const categories = plugin.categories && plugin.categories.length > 0
        ? plugin.categories
        : project?.categories && project.categories.length > 0
        ? project.categories
        : ['Utility'];

    return (
        <div className="ppi:space-y-6">
            <button
                type="button"
                onClick={onBack}
                className="ppi:inline-flex ppi:items-center ppi:gap-2 ppi:text-sm ppi:font-medium ppi:text-neutral-400 hover:ppi:text-white ppi:transition-colors"
            >
                <ArrowLeft className="ppi:h-4 ppi:w-4" />
                <span>Back to Plugins</span>
            </button>

            <div className="ppi:flex ppi:flex-col ppi:gap-4 ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/90 ppi:p-6 sm:ppi:flex-row sm:ppi:items-center sm:ppi:justify-between">
                <div className="ppi:flex ppi:items-start ppi:gap-4">
                    {plugin.icon_url || project?.icon_url ? (
                        <img
                            src={plugin.icon_url || project?.icon_url || ''}
                            alt={plugin.name}
                            className="ppi:h-16 ppi:w-16 ppi:shrink-0 ppi:rounded-2xl ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-950 ppi:object-cover sm:ppi:h-20 sm:ppi:w-20"
                            onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="ppi:flex ppi:h-16 ppi:w-16 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-2xl ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-950 ppi:text-neutral-400 sm:ppi:h-20 sm:ppi:w-20">
                            <Package className="ppi:h-8 ppi:w-8" />
                        </div>
                    )}

                    <div>
                        <div className="ppi:flex ppi:items-center ppi:gap-2">
                            <h1 className="ppi:text-xl ppi:font-bold ppi:text-white sm:ppi:text-2xl">
                                {project?.title || project?.name || plugin.name}
                            </h1>
                            <span className="ppi:rounded-md ppi:bg-blue-600/20 ppi:px-2 ppi:py-0.5 ppi:text-[10px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-blue-400">
                                {provider}
                            </span>
                        </div>

                        <div className="ppi:mt-1.5 ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-3 ppi:text-xs ppi:text-neutral-400">
                            <span className="ppi:flex ppi:items-center ppi:gap-1.5">
                                <Download className="ppi:h-3.5 ppi:w-3.5 ppi:text-neutral-500" />
                                <span>{formattedDownloads}</span>
                            </span>

                            {formattedFollowers !== null && (
                                <span className="ppi:flex ppi:items-center ppi:gap-1.5">
                                    <Heart className="ppi:h-3.5 ppi:w-3.5 ppi:text-red-400/80" />
                                    <span>{formattedFollowers}</span>
                                </span>
                            )}

                            {plugin.author && (
                                <span>
                                    by <span className="ppi:text-neutral-300">{plugin.author}</span>
                                </span>
                            )}
                        </div>

                        <p className="ppi:mt-2 ppi:text-xs ppi:text-neutral-300 sm:ppi:text-sm">
                            {plugin.short_description || project?.description || 'A Minecraft server plugin.'}
                        </p>
                    </div>
                </div>

                <div className="ppi:flex ppi:items-center ppi:gap-2 sm:ppi:self-start">
                    {plugin.url && (
                        <a
                            href={plugin.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="ppi:flex ppi:h-10 ppi:w-10 ppi:items-center ppi:justify-center ppi:rounded-xl ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-800/80 ppi:text-neutral-300 hover:ppi:bg-neutral-700 hover:ppi:text-white ppi:transition-colors"
                            title="View source website"
                        >
                            <ExternalLink className="ppi:h-4 ppi:w-4" />
                        </a>
                    )}

                    {versions.length > 0 && (
                        <button
                            type="button"
                            disabled={installMutation.isPending}
                            onClick={() => installMutation.mutate(versions[0])}
                            className="ppi:flex ppi:items-center ppi:gap-2 ppi:rounded-xl ppi:bg-blue-600 ppi:px-5 ppi:py-2.5 ppi:text-sm ppi:font-semibold ppi:text-white hover:ppi:bg-blue-500 ppi:shadow-sm ppi:transition-all active:ppi:scale-95 disabled:ppi:opacity-50"
                        >
                            {installingVersionId === versions[0].id ? (
                                <Spinner centered />
                            ) : (
                                <Download className="ppi:h-4 ppi:w-4" />
                            )}
                            <span>Install Latest</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="ppi:flex ppi:items-center ppi:gap-2 ppi:border-b ppi:border-neutral-800 ppi:pb-1">
                <button
                    type="button"
                    onClick={() => setActiveTab('description')}
                    className={`ppi:flex ppi:items-center ppi:gap-2 ppi:border-b-2 ppi:px-4 ppi:py-2.5 ppi:text-sm ppi:font-medium ppi:transition-colors ${
                        activeTab === 'description'
                            ? 'ppi:border-blue-500 ppi:text-blue-400'
                            : 'ppi:border-transparent ppi:text-neutral-400 hover:ppi:text-neutral-200'
                    }`}
                >
                    <FileText className="ppi:h-4 ppi:w-4" />
                    <span>Description</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('versions')}
                    className={`ppi:flex ppi:items-center ppi:gap-2 ppi:border-b-2 ppi:px-4 ppi:py-2.5 ppi:text-sm ppi:font-medium ppi:transition-colors ${
                        activeTab === 'versions'
                            ? 'ppi:border-blue-500 ppi:text-blue-400'
                            : 'ppi:border-transparent ppi:text-neutral-400 hover:ppi:text-neutral-200'
                    }`}
                >
                    <Layers className="ppi:h-4 ppi:w-4" />
                    <span>Versions {versions.length > 0 ? `(${versions.length})` : ''}</span>
                </button>
            </div>

            <div className="ppi:grid ppi:grid-cols-1 ppi:gap-6 lg:ppi:grid-cols-3">
                <div className="lg:ppi:col-span-2">
                    {activeTab === 'description' ? (
                        <div className="ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/90 ppi:p-6">
                            <h2 className="ppi:text-base ppi:font-semibold ppi:text-white">About {plugin.name}</h2>
                            <div className="ppi:mt-4 ppi:space-y-4 ppi:text-sm ppi:leading-relaxed ppi:text-neutral-300">
                                <p>{project?.description || plugin.short_description || 'No extended description available.'}</p>
                                {plugin.url && (
                                    <div className="ppi:pt-4">
                                        <a
                                            href={plugin.url}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className="ppi:inline-flex ppi:items-center ppi:gap-1.5 ppi:text-xs ppi:font-medium ppi:text-blue-400 hover:ppi:underline"
                                        >
                                            <span>Read full documentation on {provider}</span>
                                            <ExternalLink className="ppi:h-3.5 ppi:w-3.5" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="ppi:space-y-3">
                            {isLoading ? (
                                <div className="ppi:flex ppi:h-48 ppi:items-center ppi:justify-center ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/80">
                                    <Spinner centered />
                                </div>
                            ) : isError ? (
                                <div className="ppi:rounded-2xl ppi:border ppi:border-red-500/30 ppi:bg-red-500/10 ppi:p-6 ppi:text-center ppi:text-sm ppi:text-red-400">
                                    Failed to load versions: {httpErrorToHuman(error)}
                                </div>
                            ) : versions.length === 0 ? (
                                <div className="ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/80 ppi:p-8 ppi:text-center ppi:text-neutral-400">
                                    No versions found.
                                </div>
                            ) : (
                                versions.map((version) => {
                                    const isInstalling = installingVersionId === version.id;
                                    return (
                                        <div
                                            key={version.id}
                                            className="ppi:flex ppi:flex-col ppi:gap-3 ppi:rounded-xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/80 ppi:p-4 hover:ppi:border-neutral-600 sm:ppi:flex-row sm:ppi:items-center sm:ppi:justify-between ppi:transition-all"
                                        >
                                            <div className="ppi:min-w-0 ppi:space-y-1.5">
                                                <h3 className="ppi:truncate ppi:text-sm ppi:font-bold ppi:text-white sm:ppi:text-base">
                                                    {version.name}
                                                </h3>

                                                <div className="ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-3 ppi:text-xs ppi:text-neutral-400">
                                                    {version.downloads !== null && version.downloads !== undefined && (
                                                        <span className="ppi:flex ppi:items-center ppi:gap-1">
                                                            <Download className="ppi:h-3 ppi:w-3" />
                                                            <span>{Number(version.downloads).toLocaleString()} downloads</span>
                                                        </span>
                                                    )}

                                                    {version.published_at && (
                                                        <span className="ppi:flex ppi:items-center ppi:gap-1">
                                                            <Calendar className="ppi:h-3 ppi:w-3" />
                                                            <span>{new Date(version.published_at).toLocaleDateString()}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {version.platforms && version.platforms.length > 0 && (
                                                    <div className="ppi:text-xs ppi:text-neutral-400">
                                                        <span>Loaders: </span>
                                                        <span className="ppi:text-neutral-300">
                                                            {version.platforms.join(', ')}
                                                        </span>
                                                    </div>
                                                )}

                                                {version.game_versions && version.game_versions.length > 0 && (
                                                    <div className="ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-1 ppi:pt-1">
                                                        <span className="ppi:text-[11px] ppi:text-neutral-500">Versions:</span>
                                                        {version.game_versions.slice(0, 8).map((mcVer) => (
                                                            <span
                                                                key={mcVer}
                                                                className="ppi:rounded ppi:bg-neutral-800/90 ppi:px-1.5 ppi:py-0.5 ppi:font-mono ppi:text-[10px] ppi:text-neutral-300"
                                                            >
                                                                {mcVer}
                                                            </span>
                                                        ))}
                                                        {version.game_versions.length > 8 && (
                                                            <span className="ppi:text-[10px] ppi:text-neutral-500">
                                                                +{version.game_versions.length - 8} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="ppi:flex ppi:items-center ppi:gap-2 sm:ppi:shrink-0">
                                                {version.url && (
                                                    <a
                                                        href={version.url}
                                                        target="_blank"
                                                        rel="noreferrer noopener"
                                                        className="ppi:flex ppi:h-8 ppi:w-8 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-800/80 ppi:text-neutral-400 hover:ppi:text-white ppi:transition-colors"
                                                        title="View version page"
                                                    >
                                                        <ExternalLink className="ppi:h-3.5 ppi:w-3.5" />
                                                    </a>
                                                )}

                                                <button
                                                    type="button"
                                                    disabled={installMutation.isPending}
                                                    onClick={() => installMutation.mutate(version)}
                                                    className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-lg ppi:bg-blue-600 ppi:px-3.5 ppi:py-1.5 ppi:text-xs ppi:font-semibold ppi:text-white hover:ppi:bg-blue-500 ppi:shadow-sm ppi:transition-all active:ppi:scale-95 disabled:ppi:opacity-50"
                                                >
                                                    {isInstalling ? (
                                                        <Spinner centered />
                                                    ) : (
                                                        <Download className="ppi:h-3.5 ppi:w-3.5" />
                                                    )}
                                                    <span>Install</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                <div className="ppi:space-y-4">
                    <div className="ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/90 ppi:p-5 ppi:space-y-5">
                        {categories.length > 0 && (
                            <div>
                                <h3 className="ppi:text-xs ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400">
                                    Categories
                                </h3>
                                <div className="ppi:mt-2.5 ppi:flex ppi:flex-wrap ppi:gap-1.5">
                                    {categories.map((cat) => (
                                        <span
                                            key={cat}
                                            className="ppi:rounded-lg ppi:bg-neutral-800/90 ppi:px-2.5 ppi:py-1 ppi:text-xs ppi:font-medium ppi:text-neutral-200"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {allLoaders.length > 0 && (
                            <div>
                                <h3 className="ppi:text-xs ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400">
                                    Server Loaders
                                </h3>
                                <div className="ppi:mt-2.5 ppi:flex ppi:flex-wrap ppi:gap-1.5">
                                    {allLoaders.map((loader) => (
                                        <span
                                            key={loader}
                                            className="ppi:rounded-lg ppi:bg-neutral-800/90 ppi:px-2.5 ppi:py-1 ppi:text-xs ppi:font-medium ppi:text-neutral-300"
                                        >
                                            {loader}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {allGameVersions.length > 0 && (
                            <div>
                                <h3 className="ppi:text-xs ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400">
                                    Game Versions
                                </h3>
                                <div className="ppi:mt-2.5 ppi:flex ppi:flex-wrap ppi:gap-1.5">
                                    {allGameVersions.slice(0, 16).map((ver) => (
                                        <span
                                            key={ver}
                                            className="ppi:rounded-lg ppi:bg-neutral-800/90 ppi:px-2 ppi:py-0.5 ppi:font-mono ppi:text-[11px] ppi:text-neutral-300"
                                        >
                                            {ver}
                                        </span>
                                    ))}
                                    {allGameVersions.length > 16 && (
                                        <span className="ppi:text-xs ppi:text-neutral-500 ppi:self-center">
                                            +{allGameVersions.length - 16} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="ppi:border-t ppi:border-neutral-700/40 ppi:pt-4">
                            <h3 className="ppi:text-xs ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400">
                                Details
                            </h3>
                            <div className="ppi:mt-2.5 ppi:space-y-2 ppi:text-xs ppi:text-neutral-300">
                                {plugin.last_updated && (
                                    <div className="ppi:flex ppi:items-center ppi:gap-2">
                                        <RefreshCw className="ppi:h-3.5 ppi:w-3.5 ppi:text-neutral-500" />
                                        <span>Updated {new Date(plugin.last_updated).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {plugin.author && (
                                    <div className="ppi:flex ppi:items-center ppi:gap-2">
                                        <Boxes className="ppi:h-3.5 ppi:w-3.5 ppi:text-neutral-500" />
                                        <span>Author: {plugin.author}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
