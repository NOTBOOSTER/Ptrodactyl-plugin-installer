import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Spinner, httpErrorToHuman, toast } from '@pterodactyl/sdk';
import {
    Download,
    ExternalLink,
    Package,
    X,
    Calendar,
    Check,
} from 'lucide-react';
import { getPluginVersions, installPlugin } from '../api';
import type { PluginItem, PluginProvider, PluginVersionItem } from '../types';

interface PluginDetailsModalProps {
    open: boolean;
    onClose: () => void;
    plugin: PluginItem | null;
    serverIdentifier: string;
    provider: PluginProvider;
    onInstalled: () => void;
}

function formatDownloads(count?: number | null): string {
    if (count === undefined || count === null) return '0';
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(1)}M`;
    }
    if (count >= 1_000) {
        return `${(count / 1_000).toFixed(1)}K`;
    }
    return count.toLocaleString();
}

export function PluginDetailsModal({
    open,
    onClose,
    plugin,
    serverIdentifier,
    provider,
    onInstalled,
}: PluginDetailsModalProps): React.JSX.Element | null {
    const [installingVersionId, setInstallingVersionId] = useState<string | null>(null);

    const {
        data: versionData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['plugin-details-modal', serverIdentifier, plugin?.id, provider],
        queryFn: () => getPluginVersions(serverIdentifier, plugin!.id, provider),
        enabled: open && Boolean(plugin?.id),
    });

    const project = versionData?.project;
    const versions = versionData?.versions ?? [];

    const installMutation = useMutation({
        mutationFn: async (version: PluginVersionItem) => {
            if (!plugin) return;
            setInstallingVersionId(version.id);
            await installPlugin(serverIdentifier, plugin.id, version.id, provider);
        },
        onSuccess: (_data, version) => {
            if (!plugin || !version) return;
            toast.success(`Successfully installed ${plugin.name} (${version.name})`);
            setInstallingVersionId(null);
            onInstalled();
        },
        onError: (err: unknown) => {
            toast.error(httpErrorToHuman(err));
            setInstallingVersionId(null);
        },
    });

    if (!open || !plugin) {
        return null;
    }

    const categories = plugin.categories && plugin.categories.length > 0
        ? plugin.categories
        : project?.categories && project.categories.length > 0
        ? project.categories
        : ['Plugin'];

    const primaryLoaders = Array.from(
        new Set(versions.flatMap((v: PluginVersionItem) => v.platforms ?? []).filter(Boolean))
    ).slice(0, 4);

    const primaryVersions = Array.from(
        new Set(versions.flatMap((v: PluginVersionItem) => v.game_versions ?? []).filter(Boolean))
    ).slice(0, 3);

    return (
        <div
            className="ppi:fixed ppi:inset-0 ppi:z-50 ppi:flex ppi:items-center ppi:justify-center ppi:bg-black/75 ppi:p-4 ppi:backdrop-blur-sm ppi:transition-opacity ppi:duration-200"
            onClick={onClose}
        >
            <div
                className="ppi:relative ppi:flex ppi:w-full ppi:max-w-2xl ppi:max-h-[90vh] ppi:flex-col ppi:rounded-2xl ppi:border ppi:border-slate-700/80 ppi:bg-[#202936] ppi:shadow-2xl ppi:overflow-hidden ppi:transition-all ppi:duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="ppi:p-5 ppi:border-b ppi:border-slate-700/70 ppi:bg-[#242e3d]">
                    <div className="ppi:flex ppi:items-start ppi:gap-4">
                        {plugin.icon_url || project?.icon_url ? (
                            <img
                                src={plugin.icon_url || project?.icon_url || ''}
                                alt={plugin.name}
                                className="ppi:h-16 ppi:w-16 ppi:shrink-0 ppi:rounded-xl ppi:border ppi:border-slate-700 ppi:bg-slate-900 ppi:object-cover sm:ppi:h-20 sm:ppi:w-20"
                                onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="ppi:flex ppi:h-16 ppi:w-16 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-xl ppi:border ppi:border-slate-700 ppi:bg-slate-900 ppi:text-slate-400 sm:ppi:h-20 sm:ppi:w-20">
                                <Package className="ppi:h-8 ppi:w-8 sm:ppi:h-10 sm:ppi:w-10" />
                            </div>
                        )}

                        <div className="ppi:min-w-0 ppi:flex-1">
                            <h2 className="ppi:truncate ppi:text-lg sm:ppi:text-xl ppi:font-bold ppi:text-white" title={plugin.name}>
                                {project?.title || project?.name || plugin.name}
                            </h2>

                            {plugin.author && (
                                <p className="ppi:text-xs ppi:text-slate-400">
                                    by <span className="ppi:text-slate-300">{plugin.author}</span>
                                </p>
                            )}

                            <p className="ppi:mt-1 ppi:line-clamp-2 ppi:text-xs ppi:text-slate-300 ppi:leading-relaxed">
                                {plugin.short_description || project?.description || 'A Minecraft server plugin.'}
                            </p>

                            <div className="ppi:mt-2 ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-1.5">
                                <span className="ppi:rounded ppi:bg-blue-600/20 ppi:border ppi:border-blue-500/30 ppi:px-2 ppi:py-0.5 ppi:text-[10px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-blue-400">
                                    {provider}
                                </span>

                                {categories.slice(0, 2).map((cat: string) => (
                                    <span
                                        key={cat}
                                        className="ppi:rounded ppi:bg-slate-800 ppi:border ppi:border-slate-700 ppi:px-2 ppi:py-0.5 ppi:text-[10px] ppi:text-slate-300"
                                    >
                                        {cat}
                                    </span>
                                ))}

                                {primaryLoaders.slice(0, 2).map((loader: string) => (
                                    <span
                                        key={loader}
                                        className="ppi:rounded ppi:bg-slate-800 ppi:border ppi:border-slate-700 ppi:px-2 ppi:py-0.5 ppi:text-[10px] ppi:text-slate-300"
                                    >
                                        {loader}
                                    </span>
                                ))}

                                {primaryVersions.length > 0 && (
                                    <span className="ppi:rounded ppi:bg-slate-800 ppi:border ppi:border-slate-700 ppi:px-2 ppi:py-0.5 ppi:text-[10px] ppi:font-mono ppi:text-slate-300">
                                        MC {primaryVersions[0]}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="ppi:flex ppi:flex-col ppi:items-end ppi:gap-3 ppi:shrink-0">
                            <div className="ppi:flex ppi:items-center ppi:gap-1.5">
                                {plugin.url && (
                                    <a
                                        href={plugin.url}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        title="View source website"
                                        className="ppi:flex ppi:h-8 ppi:w-8 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:text-slate-400 hover:ppi:bg-slate-700/60 hover:ppi:text-white ppi:transition-colors"
                                    >
                                        <ExternalLink className="ppi:h-4 ppi:w-4" />
                                    </a>
                                )}

                                <button
                                    type="button"
                                    onClick={onClose}
                                    title="Close"
                                    className="ppi:flex ppi:h-8 ppi:w-8 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:text-slate-400 hover:ppi:bg-slate-700/60 hover:ppi:text-white ppi:transition-colors"
                                >
                                    <X className="ppi:h-5 ppi:w-5" />
                                </button>
                            </div>

                            {versions.length > 0 && (
                                <button
                                    type="button"
                                    disabled={installMutation.isPending}
                                    onClick={() => installMutation.mutate(versions[0])}
                                    className="ppi:rounded ppi:bg-blue-600 ppi:px-4 ppi:py-1.5 ppi:text-xs ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-white hover:ppi:bg-blue-500 ppi:shadow-sm ppi:transition-all active:ppi:scale-95 disabled:ppi:opacity-50"
                                >
                                    {installingVersionId === versions[0].id ? (
                                        <Spinner centered />
                                    ) : (
                                        <span>INSTALL LATEST</span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="ppi:flex-1 ppi:overflow-y-auto ppi:p-5 ppi:space-y-3">
                    <div className="ppi:flex ppi:items-center ppi:justify-between ppi:pb-1">
                        <span className="ppi:text-xs ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-slate-400">
                            Available Versions ({versions.length})
                        </span>
                        <span className="ppi:text-xs ppi:text-slate-500">
                            Target directory: /plugins
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="ppi:flex ppi:h-48 ppi:items-center ppi:justify-center">
                            <Spinner centered />
                        </div>
                    ) : isError ? (
                        <div className="ppi:rounded-xl ppi:border ppi:border-red-500/30 ppi:bg-red-500/10 ppi:p-5 ppi:text-center ppi:text-sm ppi:text-red-400">
                            Failed to load versions: {httpErrorToHuman(error)}
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="ppi:rounded-xl ppi:border ppi:border-slate-700/60 ppi:bg-slate-800/40 ppi:p-8 ppi:text-center ppi:text-sm ppi:text-slate-400">
                            No installable versions found for this plugin.
                        </div>
                    ) : (
                        versions.map((version: PluginVersionItem) => {
                            const isInstalling = installingVersionId === version.id;
                            return (
                                <div
                                    key={version.id}
                                    className="ppi:flex ppi:flex-col ppi:gap-3 ppi:rounded-xl ppi:border ppi:border-slate-700/60 ppi:bg-[#2b3544] ppi:p-3.5 hover:ppi:border-slate-600 sm:ppi:flex-row sm:ppi:items-center sm:ppi:justify-between ppi:transition-colors"
                                >
                                    <div className="ppi:min-w-0 ppi:space-y-1">
                                        <h4 className="ppi:truncate ppi:text-sm ppi:font-bold ppi:text-white">
                                            {version.name}
                                        </h4>

                                        <div className="ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-2.5 ppi:text-xs ppi:text-slate-400">
                                            {version.downloads !== null && version.downloads !== undefined && (
                                                <span>{formatDownloads(version.downloads)} downloads</span>
                                            )}

                                            {version.published_at && (
                                                <span>
                                                    · {new Date(version.published_at).toLocaleDateString()}
                                                </span>
                                            )}

                                            {version.platforms && version.platforms.length > 0 && (
                                                <span>
                                                    · Loaders: {version.platforms.join(', ')}
                                                </span>
                                            )}
                                        </div>

                                        {version.game_versions && version.game_versions.length > 0 && (
                                            <div className="ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-1 ppi:pt-0.5">
                                                {version.game_versions.slice(0, 6).map((mcVer: string) => (
                                                    <span
                                                        key={mcVer}
                                                        className="ppi:rounded ppi:bg-slate-800 ppi:px-1.5 ppi:py-0.5 ppi:font-mono ppi:text-[10px] ppi:text-slate-300"
                                                    >
                                                        {mcVer}
                                                    </span>
                                                ))}
                                                {version.game_versions.length > 6 && (
                                                    <span className="ppi:text-[10px] ppi:text-slate-500">
                                                        +{version.game_versions.length - 6} more
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
                                                title="View version page"
                                                className="ppi:flex ppi:h-8 ppi:w-8 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:text-slate-400 hover:ppi:bg-slate-700/60 hover:ppi:text-white ppi:transition-colors"
                                            >
                                                <ExternalLink className="ppi:h-4 ppi:w-4" />
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            disabled={installMutation.isPending}
                                            onClick={() => installMutation.mutate(version)}
                                            className="ppi:rounded ppi:bg-blue-600 ppi:px-4 ppi:py-1.5 ppi:text-xs ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-white hover:ppi:bg-blue-500 ppi:shadow-sm ppi:transition-all active:ppi:scale-95 disabled:ppi:opacity-50"
                                        >
                                            {isInstalling ? (
                                                <Spinner centered />
                                            ) : (
                                                <span>INSTALL</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
