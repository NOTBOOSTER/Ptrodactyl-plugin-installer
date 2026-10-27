import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Spinner, httpErrorToHuman, toast } from '@pterodactyl/sdk';
import {
    ExternalLink,
    Package,
    X,
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
        onSuccess: (_data, version: PluginVersionItem) => {
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
            className="ppi:fixed ppi:inset-0 ppi:z-50 ppi:flex ppi:items-center ppi:justify-center ppi:bg-black/75 ppi:p-2.5 sm:ppi:p-4 ppi:backdrop-blur-sm ppi:transition-opacity ppi:duration-200"
            onClick={onClose}
        >
            <div
                className="ppi:relative ppi:flex ppi:w-full ppi:max-w-2xl ppi:max-h-[90vh] ppi:flex-col ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#3F4D5A] ppi:shadow-2xl ppi:overflow-hidden ppi:box-border ppi:transition-all ppi:duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="ppi:p-4 sm:ppi:p-5 ppi:border-b ppi:border-white/10 ppi:bg-[#36424D]">
                    <div className="ppi:flex ppi:items-start ppi:gap-4">
                        {plugin.icon_url || project?.icon_url ? (
                            <img
                                src={plugin.icon_url || project?.icon_url || ''}
                                alt={plugin.name}
                                className="ppi:h-16 ppi:w-16 ppi:shrink-0 ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#515F6C] ppi:object-cover sm:ppi:h-20 sm:ppi:w-20"
                                onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="ppi:flex ppi:h-16 ppi:w-16 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#515F6C] ppi:text-slate-300 sm:ppi:h-20 sm:ppi:w-20">
                                <Package className="ppi:h-8 ppi:w-8 sm:ppi:h-10 sm:ppi:w-10" />
                            </div>
                        )}

                        <div className="ppi:min-w-0 ppi:flex-1">
                            <h2 className="ppi:truncate ppi:text-lg sm:ppi:text-xl ppi:font-bold ppi:text-white" title={plugin.name}>
                                {project?.title || project?.name || plugin.name}
                            </h2>

                            {plugin.author && (
                                <p className="ppi:text-xs ppi:text-slate-300">
                                    by <span className="ppi:text-white">{plugin.author}</span>
                                </p>
                            )}

                            <p className="ppi:mt-1 ppi:line-clamp-2 ppi:text-xs ppi:text-slate-200 ppi:leading-relaxed">
                                {plugin.short_description || project?.description || 'A Minecraft server plugin.'}
                            </p>

                            <div className="ppi:mt-2 ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-1.5">
                                <span className="ppi:rounded-none ppi:bg-blue-600/30 ppi:border ppi:border-blue-400/40 ppi:px-2.5 ppi:py-1 ppi:text-[10px] ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-blue-300">
                                    {provider}
                                </span>

                                {categories.slice(0, 2).map((cat: string) => (
                                    <span
                                        key={cat}
                                        className="ppi:rounded-none ppi:bg-[#515F6C] ppi:border ppi:border-white/10 ppi:px-2.5 ppi:py-1 ppi:text-[10px] ppi:text-slate-200"
                                    >
                                        {cat}
                                    </span>
                                ))}

                                {primaryLoaders.slice(0, 2).map((loader: string) => (
                                    <span
                                        key={loader}
                                        className="ppi:rounded-none ppi:bg-[#515F6C] ppi:border ppi:border-white/10 ppi:px-2.5 ppi:py-1 ppi:text-[10px] ppi:text-slate-200"
                                    >
                                        {loader}
                                    </span>
                                ))}

                                {primaryVersions.length > 0 && (
                                    <span className="ppi:rounded-none ppi:bg-[#515F6C] ppi:border ppi:border-white/10 ppi:px-2.5 ppi:py-1 ppi:text-[10px] ppi:font-mono ppi:text-slate-200">
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
                                        className="ppi:flex ppi:h-8 ppi:w-8 ppi:items-center ppi:justify-center ppi:rounded-none ppi:text-slate-300 hover:ppi:bg-[#515F6C] hover:ppi:text-white ppi:transition-colors"
                                    >
                                        <ExternalLink className="ppi:h-4 ppi:w-4" />
                                    </a>
                                )}

                                <button
                                    type="button"
                                    onClick={onClose}
                                    title="Close"
                                    className="ppi:flex ppi:h-8 ppi:w-8 ppi:items-center ppi:justify-center ppi:rounded-none ppi:text-slate-300 hover:ppi:bg-[#515F6C] hover:ppi:text-white ppi:transition-colors"
                                >
                                    <X className="ppi:h-5 ppi:w-5" />
                                </button>
                            </div>

                            {versions.length > 0 && (
                                <button
                                    type="button"
                                    disabled={installMutation.isPending}
                                    onClick={() => installMutation.mutate(versions[0])}
                                    className="ppi:flex ppi:items-center ppi:justify-center ppi:rounded-none ppi:bg-[#2964C3] ppi:h-[44px] ppi:min-w-[150px] ppi:px-6 ppi:text-xs sm:ppi:text-sm ppi:font-bold ppi:uppercase ppi:tracking-wider ppi:text-white hover:ppi:bg-[#2053a6] ppi:shadow-sm ppi:transition-all active:ppi:scale-95 disabled:ppi:opacity-50"
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
                        <span className="ppi:text-xs ppi:font-bold ppi:uppercase ppi:tracking-wider ppi:text-slate-200">
                            Available Versions ({versions.length})
                        </span>
                        <span className="ppi:text-xs ppi:text-slate-300">
                            Target directory: /plugins
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="ppi:flex ppi:h-48 ppi:items-center ppi:justify-center">
                            <Spinner centered />
                        </div>
                    ) : isError ? (
                        <div className="ppi:rounded-none ppi:border ppi:border-red-500/30 ppi:bg-red-500/10 ppi:p-5 ppi:text-center ppi:text-sm ppi:text-red-300">
                            Failed to load versions: {httpErrorToHuman(error)}
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#515F6C]/40 ppi:p-8 ppi:text-center ppi:text-sm ppi:text-slate-300">
                            No installable versions found for this plugin.
                        </div>
                    ) : (
                        versions.map((version: PluginVersionItem) => {
                            const isInstalling = installingVersionId === version.id;
                            return (
                                <div
                                    key={version.id}
                                    className="ppi:flex ppi:flex-col ppi:gap-3 ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#515F6C] ppi:p-4 hover:ppi:border-white/25 sm:ppi:flex-row sm:ppi:items-center sm:ppi:justify-between ppi:transition-colors"
                                >
                                    <div className="ppi:min-w-0 ppi:space-y-1">
                                        <h4 className="ppi:truncate ppi:text-sm sm:ppi:text-base ppi:font-bold ppi:text-white">
                                            {version.name}
                                        </h4>

                                        <div className="ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-2.5 ppi:text-xs ppi:text-slate-300">
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
                                            <div className="ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-1 ppi:pt-1">
                                                {version.game_versions.slice(0, 6).map((mcVer: string) => (
                                                    <span
                                                        key={mcVer}
                                                        className="ppi:rounded-none ppi:bg-[#3F4D5A] ppi:border ppi:border-white/10 ppi:px-2 ppi:py-0.5 ppi:font-mono ppi:text-[10px] ppi:text-slate-200"
                                                    >
                                                        {mcVer}
                                                    </span>
                                                ))}
                                                {version.game_versions.length > 6 && (
                                                    <span className="ppi:text-[10px] ppi:text-slate-300">
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
                                                className="ppi:flex ppi:h-8 ppi:w-8 ppi:items-center ppi:justify-center ppi:rounded-none ppi:text-slate-300 hover:ppi:bg-[#3F4D5A] hover:ppi:text-white ppi:transition-colors"
                                            >
                                                <ExternalLink className="ppi:h-4 ppi:w-4" />
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            disabled={installMutation.isPending}
                                            onClick={() => installMutation.mutate(version)}
                                            className="ppi:flex ppi:items-center ppi:justify-center ppi:rounded-none ppi:bg-[#2964C3] ppi:h-[38px] ppi:min-w-[110px] ppi:px-5 ppi:text-xs ppi:font-bold ppi:uppercase ppi:tracking-wider ppi:text-white hover:ppi:bg-[#2053a6] ppi:shadow-sm ppi:transition-all active:ppi:scale-95 disabled:ppi:opacity-50"
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
