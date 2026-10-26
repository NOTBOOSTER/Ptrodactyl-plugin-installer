import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner, httpErrorToHuman, toast } from '@pterodactyl/sdk';
import {
    Search,
    Trash2,
    RefreshCw,
    Package,
    AlertCircle,
    CheckCircle2,
    FolderOpen,
} from 'lucide-react';
import { getInstalledPluginFiles, deletePluginFile } from '../api';
import type { InstalledPluginFile } from '../types';

interface ManagePluginsViewProps {
    serverIdentifier: string;
    onBrowseClick: () => void;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function ManagePluginsView({
    serverIdentifier,
    onBrowseClick,
}: ManagePluginsViewProps): React.JSX.Element {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [deletingFileName, setDeletingFileName] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const {
        data: files = [],
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ['installed-plugin-files', serverIdentifier],
        queryFn: () => getInstalledPluginFiles(serverIdentifier),
    });

    const deleteMutation = useMutation({
        mutationFn: async (fileName: string) => {
            setDeletingFileName(fileName);
            await deletePluginFile(serverIdentifier, fileName);
        },
        onSuccess: (_data, fileName) => {
            toast.success(`Successfully deleted ${fileName}`);
            setDeletingFileName(null);
            queryClient.invalidateQueries({ queryKey: ['installed-plugin-files', serverIdentifier] });
            queryClient.invalidateQueries({ queryKey: ['installed-plugins', serverIdentifier] });
        },
        onError: (err: unknown) => {
            toast.error(httpErrorToHuman(err));
            setDeletingFileName(null);
        },
    });

    const filteredFiles = files.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    return (
        <div className="ppi:space-y-6">
            <div className="ppi:flex ppi:flex-col ppi:gap-4 sm:ppi:flex-row sm:ppi:items-center sm:ppi:justify-between">
                <div>
                    <h2 className="ppi:text-xl ppi:font-bold ppi:text-white">Installed Plugins</h2>
                    <p className="ppi:text-xs ppi:text-neutral-400">
                        Manage all plugin .jar files currently present in your server&apos;s /plugins folder.
                    </p>
                </div>

                <div className="ppi:flex ppi:items-center ppi:gap-2">
                    <span className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-lg ppi:border ppi:border-neutral-700 ppi:bg-neutral-800/80 ppi:px-3 ppi:py-1.5 ppi:text-xs ppi:text-neutral-300">
                        <CheckCircle2 className="ppi:h-4 ppi:w-4 ppi:text-green-400" />
                        <span>Total: <strong className="ppi:text-white">{files.length}</strong></span>
                    </span>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isRefetching || isLoading}
                        className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-lg ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-800/90 ppi:px-3 ppi:py-1.5 ppi:text-xs ppi:font-medium ppi:text-neutral-200 hover:ppi:bg-neutral-700 hover:ppi:text-white ppi:transition-colors disabled:ppi:opacity-50"
                        title="Refresh installed files"
                    >
                        <RefreshCw className={`ppi:h-3.5 ppi:w-3.5 ${isRefetching ? 'ppi:animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <div className="ppi:relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter installed plugins..."
                    className="ppi:w-full ppi:rounded-xl ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-900/90 ppi:py-2.5 ppi:pl-10 ppi:pr-4 ppi:text-sm ppi:text-white ppi:placeholder-neutral-500 ppi:outline-none hover:ppi:border-neutral-600 focus:ppi:border-blue-500"
                />
                <Search className="ppi:absolute ppi:left-3.5 ppi:top-3.5 ppi:h-4 ppi:w-4 ppi:text-neutral-500" />
            </div>

            {isLoading ? (
                <div className="ppi:flex ppi:h-48 ppi:items-center ppi:justify-center ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/80">
                    <Spinner centered />
                </div>
            ) : isError ? (
                <div className="ppi:rounded-2xl ppi:border ppi:border-red-500/30 ppi:bg-red-500/10 ppi:p-6 ppi:text-center ppi:text-sm ppi:text-red-400">
                    <AlertCircle className="ppi:mx-auto ppi:h-6 ppi:w-6 ppi:text-red-400" />
                    <p className="ppi:mt-2">Failed to load plugins directory: {httpErrorToHuman(error)}</p>
                </div>
            ) : files.length === 0 ? (
                <div className="ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/80 ppi:p-10 ppi:text-center">
                    <FolderOpen className="ppi:mx-auto ppi:h-10 ppi:w-10 ppi:text-neutral-500" />
                    <h3 className="ppi:mt-3 ppi:text-base ppi:font-semibold ppi:text-white">No plugins installed</h3>
                    <p className="ppi:mt-1 ppi:text-xs ppi:text-neutral-400">
                        The /plugins directory is currently empty or has not been created yet.
                    </p>
                    <button
                        type="button"
                        onClick={onBrowseClick}
                        className="ppi:mt-5 ppi:inline-flex ppi:items-center ppi:gap-2 ppi:rounded-xl ppi:bg-blue-600 ppi:px-4 ppi:py-2 ppi:text-xs ppi:font-semibold ppi:text-white hover:ppi:bg-blue-500 ppi:transition-colors"
                    >
                        <Search className="ppi:h-3.5 ppi:w-3.5" />
                        <span>Browse Marketplace</span>
                    </button>
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/80 ppi:p-8 ppi:text-center ppi:text-sm ppi:text-neutral-400">
                    No installed plugins match &quot;{searchQuery}&quot;
                </div>
            ) : (
                <div className="ppi:grid ppi:grid-cols-1 ppi:gap-3 sm:ppi:grid-cols-2 lg:ppi:grid-cols-3">
                    {filteredFiles.map((file) => {
                        const isDeleting = deletingFileName === file.name;
                        return (
                            <div
                                key={file.name}
                                className="ppi:flex ppi:items-center ppi:justify-between ppi:gap-3 ppi:rounded-xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/90 ppi:p-4 hover:ppi:border-neutral-600 ppi:transition-colors"
                            >
                                <div className="ppi:flex ppi:min-w-0 ppi:items-center ppi:gap-3">
                                    <div className="ppi:flex ppi:h-10 ppi:w-10 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:bg-neutral-800 ppi:text-blue-400">
                                        <Package className="ppi:h-5 ppi:w-5" />
                                    </div>
                                    <div className="ppi:min-w-0">
                                        <h4 className="ppi:truncate ppi:text-xs sm:ppi:text-sm ppi:font-semibold ppi:text-white" title={file.name}>
                                            {file.name}
                                        </h4>
                                        <p className="ppi:text-[11px] ppi:text-neutral-400">
                                            {formatBytes(file.size)}
                                            {file.modifiedAt && (
                                                <span> · {new Date(file.modifiedAt).toLocaleDateString()}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={deleteMutation.isPending}
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to uninstall and delete ${file.name}?`)) {
                                            deleteMutation.mutate(file.name);
                                        }
                                    }}
                                    className="ppi:flex ppi:h-8 ppi:w-8 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:border ppi:border-red-500/20 ppi:bg-red-500/10 ppi:text-red-400 hover:ppi:bg-red-500/20 hover:ppi:text-red-300 ppi:transition-colors disabled:ppi:opacity-50"
                                    title={`Delete ${file.name}`}
                                >
                                    {isDeleting ? (
                                        <Spinner centered />
                                    ) : (
                                        <Trash2 className="ppi:h-4 ppi:w-4" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
