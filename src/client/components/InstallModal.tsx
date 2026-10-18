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
            className="ppi:fixed ppi:inset-0 ppi:z-50 ppi:flex ppi:items-center ppi:justify-center ppi:bg-black/70 ppi:p-4 ppi:backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="ppi:relative ppi:w-full ppi:max-w-xl ppi:rounded-2xl ppi:border ppi:border-neutral-700 ppi:bg-neutral-900 ppi:shadow-2xl ppi:overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="ppi:flex ppi:items-center ppi:justify-between ppi:border-b ppi:border-neutral-800 ppi:px-6 ppi:py-4">
                    <div className="ppi:flex ppi:items-center ppi:gap-2.5">
                        <span className="ppi:rounded-md ppi:bg-blue-600/20 ppi:px-2 ppi:py-0.5 ppi:text-xs ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-blue-400">
                            {provider}
                        </span>
                        <h2 className="ppi:text-lg ppi:font-semibold ppi:text-white">Install Plugin</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ppi:rounded-lg ppi:p-1.5 ppi:text-neutral-400 hover:ppi:bg-neutral-800 hover:ppi:text-neutral-100 ppi:transition-colors"
                        aria-label="Close dialog"
                    >
                        <X className="ppi:h-5 ppi:w-5" />
                    </button>
                </div>

                <div className="ppi:p-6">
                    <div className="ppi:flex ppi:items-start ppi:gap-4">
                        {plugin.icon_url ? (
                            <img
                                src={plugin.icon_url}
                                alt={plugin.name}
                                className="ppi:h-16 ppi:w-16 ppi:shrink-0 ppi:rounded-xl ppi:border ppi:border-neutral-700 ppi:bg-neutral-950 ppi:object-cover"
                                onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="ppi:flex ppi:h-16 ppi:w-16 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-xl ppi:border ppi:border-neutral-700 ppi:bg-neutral-950 ppi:text-neutral-400">
                                <Package className="ppi:h-8 ppi:w-8" />
                            </div>
                        )}

                        <div className="ppi:min-w-0 ppi:flex-1">
                            <div className="ppi:flex ppi:items-center ppi:gap-2">
                                <h3 className="ppi:truncate ppi:text-base ppi:font-bold ppi:text-white">{plugin.name}</h3>
                                {plugin.url && (
                                    <a
                                        href={plugin.url}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="ppi:text-neutral-400 hover:ppi:text-neutral-200"
                                        title="View source"
                                    >
                                        <ExternalLink className="ppi:h-4 ppi:w-4" />
                                    </a>
                                )}
                            </div>
                            {plugin.author && (
                                <p className="ppi:text-xs ppi:text-neutral-400">
                                    Author: <span className="ppi:text-neutral-200">{plugin.author}</span>
                                </p>
                            )}
                            <p className="ppi:mt-2 ppi:text-xs ppi:text-neutral-300">
                                {plugin.short_description || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                    <div className="ppi:mt-6 ppi:rounded-xl ppi:border ppi:border-neutral-800 ppi:bg-neutral-950/60 ppi:p-4">
                        <label className="ppi:block ppi:text-xs ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-neutral-400">
                            Select Version
                        </label>

                        {isLoadingVersions ? (
                            <div className="ppi:flex ppi:items-center ppi:justify-center ppi:py-6">
                                <Spinner centered />
                            </div>
                        ) : isError ? (
                            <p className="ppi:mt-2 ppi:text-xs ppi:text-red-400">
                                Failed to load plugin versions: {httpErrorToHuman(error)}
                            </p>
                        ) : versions.length === 0 ? (
                            <p className="ppi:mt-2 ppi:text-xs ppi:text-neutral-400">
                                No downloadable versions found for the selected filters.
                            </p>
                        ) : (
                            <div className="ppi:mt-2">
                                <select
                                    value={selectedVersionId}
                                    onChange={(e) => setSelectedVersionId(e.target.value)}
                                    className="ppi:w-full ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:bg-neutral-900 ppi:px-3 ppi:py-2.5 ppi:text-sm ppi:text-white ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
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
                                    <div className="ppi:mt-3 ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-1.5">
                                        <span className="ppi:text-[11px] ppi:text-neutral-400">Supported MC:</span>
                                        {selectedVersion.game_versions.slice(0, 8).map((gv) => (
                                            <span
                                                key={gv}
                                                className="ppi:rounded ppi:bg-neutral-800 ppi:px-1.5 ppi:py-0.5 ppi:text-[10px] ppi:font-mono ppi:text-neutral-300"
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

                <div className="ppi:flex ppi:items-center ppi:justify-end ppi:gap-3 ppi:border-t ppi:border-neutral-800 ppi:bg-neutral-950/40 ppi:px-6 ppi:py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={installMutation.isPending}
                        className="ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:px-4 ppi:py-2 ppi:text-sm ppi:font-medium ppi:text-neutral-300 hover:ppi:bg-neutral-800 hover:ppi:text-white ppi:transition-colors disabled:ppi:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => installMutation.mutate()}
                        disabled={!selectedVersionId || installMutation.isPending || isLoadingVersions}
                        className="ppi:flex ppi:items-center ppi:gap-2 ppi:rounded-lg ppi:bg-blue-600 ppi:px-4 ppi:py-2 ppi:text-sm ppi:font-semibold ppi:text-white hover:ppi:bg-blue-500 ppi:transition-colors disabled:ppi:pointer-events-none disabled:ppi:opacity-50"
                    >
                        {installMutation.isPending ? (
                            <>
                                <Spinner />
                                <span>Installing...</span>
                            </>
                        ) : (
                            <>
                                <Download className="ppi:h-4 ppi:w-4" />
                                <span>Install to /plugins</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
