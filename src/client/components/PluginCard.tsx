import React from 'react';
import { ExternalLink, Info, Package } from 'lucide-react';
import type { PluginItem } from '../types';

interface PluginCardProps {
    plugin: PluginItem;
    onOpenDetails: (plugin: PluginItem) => void;
    onInstall: (plugin: PluginItem) => void;
}

function formatDownloads(count?: number): string {
    if (count === undefined || count === null) return '0';
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(1)}M`;
    }
    if (count >= 1_000) {
        return `${(count / 1_000).toFixed(1)}K`;
    }
    return count.toLocaleString();
}

export function PluginCard({ plugin, onOpenDetails, onInstall }: PluginCardProps): React.JSX.Element {
    const formattedDownloads = formatDownloads(plugin.downloads);

    return (
        <div className="ppi:relative ppi:flex ppi:flex-col ppi:justify-between ppi:rounded-xl ppi:border ppi:border-white/10 ppi:bg-[#3F4D5A] ppi:p-4.5 ppi:transition-all ppi:duration-200 hover:ppi:border-white/25 hover:ppi:shadow-lg">
            <div>
                <div className="ppi:flex ppi:items-start ppi:gap-3.5">
                    {plugin.icon_url ? (
                        <img
                            src={plugin.icon_url}
                            alt={plugin.name}
                            className="ppi:h-14 ppi:w-14 ppi:shrink-0 ppi:rounded-lg ppi:border ppi:border-white/10 ppi:bg-[#515F6C] ppi:object-cover"
                            onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="ppi:flex ppi:h-14 ppi:w-14 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:border ppi:border-white/10 ppi:bg-[#515F6C] ppi:text-slate-300">
                            <Package className="ppi:h-7 ppi:w-7" />
                        </div>
                    )}

                    <div className="ppi:min-w-0 ppi:flex-1 ppi:pr-14">
                        <h3
                            onClick={() => onOpenDetails(plugin)}
                            className="ppi:truncate ppi:text-sm sm:ppi:text-base ppi:font-bold ppi:text-white hover:ppi:text-blue-300 ppi:cursor-pointer ppi:transition-colors"
                            title={plugin.name}
                        >
                            {plugin.name}
                        </h3>

                        {plugin.author && (
                            <p className="ppi:text-xs ppi:text-slate-300 ppi:truncate">
                                by {plugin.author}
                            </p>
                        )}

                        <p className="ppi:mt-1.5 ppi:line-clamp-2 ppi:text-xs ppi:text-slate-200 ppi:leading-relaxed">
                            {plugin.short_description || 'No description provided.'}
                        </p>

                        <div className="ppi:mt-1.5 ppi:text-xs ppi:text-slate-300">
                            <span>{formattedDownloads} downloads</span>
                            {plugin.followers !== undefined && plugin.followers !== null && (
                                <span> · {plugin.followers.toLocaleString()} likes</span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => onOpenDetails(plugin)}
                            className="ppi:mt-1 ppi:inline-block ppi:text-xs ppi:font-medium ppi:text-blue-400 hover:ppi:text-blue-300 ppi:underline ppi:transition-colors"
                        >
                            Read more
                        </button>
                    </div>
                </div>

                <div className="ppi:absolute ppi:top-3.5 ppi:right-3.5 ppi:flex ppi:items-center ppi:gap-1.5">
                    <button
                        type="button"
                        onClick={() => onOpenDetails(plugin)}
                        title="View details & versions"
                        className="ppi:flex ppi:h-7 ppi:w-7 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:text-slate-300 hover:ppi:bg-[#515F6C] hover:ppi:text-white ppi:transition-colors"
                    >
                        <Info className="ppi:h-4 ppi:w-4" />
                    </button>

                    {plugin.url && (
                        <a
                            href={plugin.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            title="View on source website"
                            className="ppi:flex ppi:h-7 ppi:w-7 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:text-slate-300 hover:ppi:bg-[#515F6C] hover:ppi:text-white ppi:transition-colors"
                        >
                            <ExternalLink className="ppi:h-4 ppi:w-4" />
                        </a>
                    )}
                </div>
            </div>

            <div className="ppi:mt-3 ppi:flex ppi:justify-end">
                <button
                    type="button"
                    onClick={() => onInstall(plugin)}
                    className="ppi:rounded ppi:bg-blue-600 ppi:px-4 ppi:py-1.5 ppi:text-xs ppi:font-semibold ppi:uppercase ppi:tracking-wider ppi:text-white hover:ppi:bg-blue-500 ppi:shadow-sm ppi:transition-all active:ppi:scale-95"
                >
                    INSTALL
                </button>
            </div>
        </div>
    );
}
