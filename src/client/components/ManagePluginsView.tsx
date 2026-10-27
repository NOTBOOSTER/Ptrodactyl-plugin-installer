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
        onSuccess: (_data, fileName: string) => {
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

    const filteredFiles = files.filter((f: InstalledPluginFile) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    return (
        <div className="ppi:space-y-6 ppi:w-full ppi:max-w-full ppi:overflow-x-hidden">
            <div className="ppi:flex ppi:flex-col ppi:gap-4 sm:ppi:flex-row sm:ppi:items-center sm:ppi:justify-between">
                <div>
                    <h2 className="ppi:text-xl ppi:font-bold ppi:text-white">Installed Plugins</h2>
                    <p className="ppi:text-xs ppi:text-slate-300">
                        Manage all plugin .jar files currently present in your server&apos;s /plugins folder.
                    </p>
                </div>

                <div className="ppi:flex ppi:items-center ppi:gap-2">
                    <span className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#515F6C] ppi:h-[40px] ppi:px-4 ppi:text-xs ppi:text-slate-200">
                        <CheckCircle2 className="ppi:h-4 ppi:w-4 ppi:text-green-400" />
                        <span>Total: <strong className="ppi:text-white">{files.length}</strong></span>
                    </span>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isRefetching || isLoading}
                        className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#515F6C] ppi:h-[40px] ppi:px-4 ppi:text-xs ppi:font-bold ppi:text-slate-200 hover:ppi:bg-[#627282] hover:ppi:text-white ppi:transition-colors disabled:ppi:opacity-50"
                        title="Refresh installed files"
                    >
                        <RefreshCw className={`ppi:h-3.5 ppi:w-3.5 ${isRefetching ? 'ppi:animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <div className="ppi:relative ppi:w-full ppi:max-w-full">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    placeholder="Filter installed plugins..."
                    className="ppi:w-full ppi:max-w-full ppi:box-border ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#515F6C] ppi:h-[46px] ppi:pl-10 ppi:pr-4 ppi:text-sm ppi:text-white ppi:placeholder-slate-300 ppi:outline-none focus:ppi:ring-2 focus:ppi:ring-[#2964C3]"
                />
                <Search className="ppi:absolute ppi:left-3.5 ppi:top-3.5 ppi:h-4 ppi:w-4 ppi:text-slate-300" />
            </div>

            {isLoading ? (
                <div className="ppi:flex ppi:h-48 ppi:items-center ppi:justify-center ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#3F4D5A]">
                    <Spinner centered />
                </div>
            ) : isError ? (
                <div className="ppi:rounded-none ppi:border ppi:border-red-500/30 ppi:bg-red-500/10 ppi:p-6 ppi:text-center ppi:text-sm ppi:text-red-300">
                    <AlertCircle className="ppi:mx-auto ppi:h-6 ppi:w-6 ppi:text-red-400" />
                    <p className="ppi:mt-2">Failed to load plugins directory: {httpErrorToHuman(error)}</p>
                </div>
            ) : files.length === 0 ? (
                <div className="ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#3F4D5A] ppi:p-10 ppi:text-center">
                    <FolderOpen className="ppi:mx-auto ppi:h-10 ppi:w-10 ppi:text-slate-300" />
                    <h3 className="ppi:mt-3 ppi:text-base ppi:font-semibold ppi:text-white">No plugins installed</h3>
                    <p className="ppi:mt-1 ppi:text-xs ppi:text-slate-300">
                        The /plugins directory is currently empty or has not been created yet.
                    </p>
                    <button
                        type="button"
                        onClick={onBrowseClick}
                        className="ppi:mt-5 ppi:inline-flex ppi:items-center ppi:justify-center ppi:gap-2 ppi:rounded-none ppi:bg-[#2964C3] ppi:h-[44px] ppi:min-w-[180px] ppi:px-6 ppi:text-sm ppi:font-bold ppi:text-white hover:ppi:bg-[#2053a6] ppi:transition-colors"
                    >
                        <Search className="ppi:h-4 ppi:w-4" />
                        <span>Browse Marketplace</span>
                    </button>
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#3F4D5A] ppi:p-8 ppi:text-center ppi:text-sm ppi:text-slate-300">
                    No installed plugins match &quot;{searchQuery}&quot;
                </div>
            ) : (
                <div className="ppi-plugins-grid">
                    {filteredFiles.map((file: InstalledPluginFile) => {
                        const isDeleting = deletingFileName === file.name;
                        return (
                            <div
                                key={file.name}
                                className="ppi:flex ppi:items-center ppi:justify-between ppi:gap-3 ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#3F4D5A] ppi:p-4 hover:ppi:border-white/20 ppi:transition-colors"
                            >
                                <div className="ppi:flex ppi:min-w-0 ppi:items-center ppi:gap-3">
                                    <div className="ppi:flex ppi:h-10 ppi:w-10 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-none ppi:bg-[#515F6C] ppi:text-blue-300">
                                        <Package className="ppi:h-5 ppi:w-5" />
                                    </div>
                                    <div className="ppi:min-w-0">
                                        <h4 className="ppi:truncate ppi:text-xs sm:ppi:text-sm ppi:font-semibold ppi:text-white" title={file.name}>
                                            {file.name}
                                        </h4>
                                        <p className="ppi:text-[11px] ppi:text-slate-300">
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
                                    className="ppi:flex ppi:h-9 ppi:w-9 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-none ppi:border ppi:border-red-500/20 ppi:bg-red-500/10 ppi:text-red-400 hover:ppi:bg-red-500/20 hover:ppi:text-red-300 ppi:transition-colors disabled:ppi:opacity-50"
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
