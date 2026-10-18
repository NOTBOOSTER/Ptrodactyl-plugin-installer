import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { httpErrorToHuman, toast, Spinner } from '@pterodactyl/sdk';
import { X, Download, Package, ExternalLink } from 'lucide-react';
import { getPluginVersions, installPlugin } from '../api';
import type { PluginItem, PluginProvider } from '../types';

interface InstallModalProps {
    open: boolean;
    onClose: () => void;
    plugin: PluginItem | null;
    serverIdentifier: string;
    provider: PluginProvider;
    minecraftVersion?: string;
    pluginLoader?: string;
    onInstalled: () => void;
}

export function InstallModal({
    open,
    onClose,
    plugin,
    serverIdentifier,
    provider,
    minecraftVersion,
    pluginLoader,
    onInstalled,
}: InstallModalProps): React.JSX.Element | null {
    const [selectedVersionId, setSelectedVersionId] = useState<string>('');

    const {
        data: versionData,
        isLoading: isLoadingVersions,
        isError,
        error,
    } = useQuery({
        queryKey: ['plugin-versions', serverIdentifier, plugin?.id, provider, pluginLoader, minecraftVersion],
        queryFn: () => getPluginVersions(serverIdentifier, plugin!.id, provider, pluginLoader, minecraftVersion),
        enabled: open && Boolean(plugin?.id),
    });

    const versions = versionData?.versions ?? [];

    useEffect(() => {
        if (versions.length > 0) {
            setSelectedVersionId(versions[0].id);
        } else {
            setSelectedVersionId('');
        }
    }, [versions]);

    const installMutation = useMutation({
        mutationFn: () => {
            if (!plugin?.id || !selectedVersionId) {
                throw new Error('Please select a version to install.');
            }
            return installPlugin(serverIdentifier, plugin.id, selectedVersionId, provider);
        },
        onSuccess: () => {
            toast.success(`Successfully installed ${plugin?.name ?? 'plugin'} to /plugins`);
            onInstalled();
            onClose();
        },
        onError: (err: unknown) => {
            toast.error(httpErrorToHuman(err));
        },
    });

    if (!open || !plugin) {
        return null;
    }

    const selectedVersion = versions.find((v) => v.id === selectedVersionId);

    return (
        <div
            className="mpi:fixed mpi:inset-0 mpi:z-50 mpi:flex mpi:items-center mpi:justify-center mpi:bg-black/70 mpi:p-4 mpi:backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="mpi:relative mpi:w-full mpi:max-w-xl mpi:rounded-2xl mpi:border mpi:border-neutral-700 mpi:bg-neutral-900 mpi:shadow-2xl mpi:overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mpi:flex mpi:items-center mpi:justify-between mpi:border-b mpi:border-neutral-800 mpi:px-6 mpi:py-4">
                    <div className="mpi:flex mpi:items-center mpi:gap-2.5">
                        <span className="mpi:rounded-md mpi:bg-blue-600/20 mpi:px-2 mpi:py-0.5 mpi:text-xs mpi:font-semibold mpi:uppercase mpi:tracking-wider mpi:text-blue-400">
                            {provider}
                        </span>
                        <h2 className="mpi:text-lg mpi:font-semibold mpi:text-white">Install Plugin</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mpi:rounded-lg mpi:p-1.5 mpi:text-neutral-400 hover:mpi:bg-neutral-800 hover:mpi:text-neutral-100 mpi:transition-colors"
                        aria-label="Close dialog"
                    >
                        <X className="mpi:h-5 mpi:w-5" />
                    </button>
                </div>

                <div className="mpi:p-6">
                    <div className="mpi:flex mpi:items-start mpi:gap-4">
                        {plugin.icon_url ? (
                            <img
                                src={plugin.icon_url}
                                alt={plugin.name}
                                className="mpi:h-16 mpi:w-16 mpi:shrink-0 mpi:rounded-xl mpi:border mpi:border-neutral-700 mpi:bg-neutral-950 mpi:object-cover"
                                onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="mpi:flex mpi:h-16 mpi:w-16 mpi:shrink-0 mpi:items-center mpi:justify-center mpi:rounded-xl mpi:border mpi:border-neutral-700 mpi:bg-neutral-950 mpi:text-neutral-400">
                                <Package className="mpi:h-8 mpi:w-8" />
                            </div>
                        )}

                        <div className="mpi:min-w-0 mpi:flex-1">
                            <div className="mpi:flex mpi:items-center mpi:gap-2">
                                <h3 className="mpi:truncate mpi:text-base mpi:font-bold mpi:text-white">{plugin.name}</h3>
                                {plugin.url && (
                                    <a
                                        href={plugin.url}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="mpi:text-neutral-400 hover:mpi:text-neutral-200"
                                        title="View source"
                                    >
                                        <ExternalLink className="mpi:h-4 mpi:w-4" />
                                    </a>
                                )}
                            </div>
                            {plugin.author && (
                                <p className="mpi:text-xs mpi:text-neutral-400">
                                    Author: <span className="mpi:text-neutral-200">{plugin.author}</span>
                                </p>
                            )}
                            <p className="mpi:mt-2 mpi:text-xs mpi:text-neutral-300">
                                {plugin.short_description || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                    <div className="mpi:mt-6 mpi:rounded-xl mpi:border mpi:border-neutral-800 mpi:bg-neutral-950/60 mpi:p-4">
                        <label className="mpi:block mpi:text-xs mpi:font-semibold mpi:uppercase mpi:tracking-wider mpi:text-neutral-400">
                            Select Version
                        </label>

                        {isLoadingVersions ? (
                            <div className="mpi:flex mpi:items-center mpi:justify-center mpi:py-6">
                                <Spinner centered />
                            </div>
                        ) : isError ? (
                            <p className="mpi:mt-2 mpi:text-xs mpi:text-red-400">
                                Failed to load plugin versions: {httpErrorToHuman(error)}
                            </p>
                        ) : versions.length === 0 ? (
                            <p className="mpi:mt-2 mpi:text-xs mpi:text-neutral-400">
                                No downloadable versions found for the selected filters.
                            </p>
                        ) : (
                            <div className="mpi:mt-2">
                                <select
                                    value={selectedVersionId}
                                    onChange={(e) => setSelectedVersionId(e.target.value)}
                                    className="mpi:w-full mpi:rounded-lg mpi:border mpi:border-neutral-700 mpi:bg-neutral-900 mpi:px-3 mpi:py-2.5 mpi:text-sm mpi:text-white mpi:outline-none hover:mpi:border-neutral-600 focus:mpi:border-blue-500"
                                >
                                    {versions.map((version) => (
                                        <option key={version.id} value={version.id}>
                                            {version.name}
                                            {version.game_versions && version.game_versions.length > 0
                                                ? ` (MC: ${version.game_versions.slice(0, 3).join(', ')})`
                                                : ''}
                                        </option>
                                    ))}
                                </select>

                                {selectedVersion && selectedVersion.game_versions && selectedVersion.game_versions.length > 0 && (
                                    <div className="mpi:mt-3 mpi:flex mpi:flex-wrap mpi:items-center mpi:gap-1.5">
                                        <span className="mpi:text-[11px] mpi:text-neutral-400">Supported MC:</span>
                                        {selectedVersion.game_versions.slice(0, 8).map((gv) => (
                                            <span
                                                key={gv}
                                                className="mpi:rounded mpi:bg-neutral-800 mpi:px-1.5 mpi:py-0.5 mpi:text-[10px] mpi:font-mono mpi:text-neutral-300"
                                            >
                                                {gv}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mpi:flex mpi:items-center mpi:justify-end mpi:gap-3 mpi:border-t mpi:border-neutral-800 mpi:bg-neutral-950/40 mpi:px-6 mpi:py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={installMutation.isPending}
                        className="mpi:rounded-lg mpi:border mpi:border-neutral-700 mpi:px-4 mpi:py-2 mpi:text-sm mpi:font-medium mpi:text-neutral-300 hover:mpi:bg-neutral-800 hover:mpi:text-white mpi:transition-colors disabled:mpi:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => installMutation.mutate()}
                        disabled={!selectedVersionId || installMutation.isPending || isLoadingVersions}
                        className="mpi:flex mpi:items-center mpi:gap-2 mpi:rounded-lg mpi:bg-blue-600 mpi:px-4 mpi:py-2 mpi:text-sm mpi:font-semibold mpi:text-white hover:mpi:bg-blue-500 mpi:transition-colors disabled:mpi:pointer-events-none disabled:mpi:opacity-50"
                    >
                        {installMutation.isPending ? (
                            <>
                                <Spinner />
                                <span>Installing...</span>
                            </>
                        ) : (
                            <>
                                <Download className="mpi:h-4 mpi:w-4" />
                                <span>Install to /plugins</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
