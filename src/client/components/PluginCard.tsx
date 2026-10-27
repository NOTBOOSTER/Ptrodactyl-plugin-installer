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
        <div className="ppi:relative ppi:flex ppi:flex-col ppi:justify-between ppi:w-full ppi:max-w-full ppi:overflow-hidden ppi:box-border ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#3F4D5A] ppi:p-4 sm:ppi:p-5 ppi:transition-all ppi:duration-200 hover:ppi:border-white/25 hover:ppi:shadow-lg">
            <div className="ppi:w-full ppi:min-w-0">
                <div className="ppi:flex ppi:items-start ppi:gap-3 sm:ppi:gap-3.5">
                    {plugin.icon_url ? (
                        <img
                            src={plugin.icon_url}
                            alt={plugin.name}
                            className="ppi:h-12 ppi:w-12 sm:ppi:h-14 sm:ppi:w-14 ppi:shrink-0 ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#515F6C] ppi:object-cover"
                            onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="ppi:flex ppi:h-12 ppi:w-12 sm:ppi:h-14 sm:ppi:w-14 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-none ppi:border ppi:border-white/10 ppi:bg-[#515F6C] ppi:text-slate-300">
                            <Package className="ppi:h-6 ppi:w-6 sm:ppi:h-7 sm:ppi:w-7" />
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

                        <div className="ppi:mt-1.5 ppi:flex ppi:flex-wrap ppi:items-center ppi:gap-x-2 ppi:gap-y-0.5 ppi:text-xs ppi:text-slate-300">
                            <span>{formattedDownloads} downloads</span>
                            {plugin.followers !== undefined && plugin.followers !== null && (
                                <span>· {plugin.followers.toLocaleString()} likes</span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => onOpenDetails(plugin)}
                            className="ppi:mt-1.5 ppi:inline-block ppi:text-xs ppi:font-semibold ppi:text-blue-400 hover:ppi:text-blue-300 ppi:underline ppi:transition-colors"
                        >
                            Read more
                        </button>
                    </div>
                </div>

                <div className="ppi:absolute ppi:top-3.5 sm:ppi:top-4 ppi:right-3.5 sm:ppi:right-4 ppi:flex ppi:items-center ppi:gap-1.5">
                    <button
                        type="button"
                        onClick={() => onOpenDetails(plugin)}
                        title="View details & versions"
                        className="ppi:flex ppi:h-8 ppi:w-8 ppi:items-center ppi:justify-center ppi:rounded-none ppi:text-slate-300 hover:ppi:bg-[#515F6C] hover:ppi:text-white ppi:transition-colors"
                    >
                        <Info className="ppi:h-4 ppi:w-4" />
                    </button>

                    {plugin.url && (
                        <a
                            href={plugin.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            title="View on source website"
                            className="ppi:flex ppi:h-8 ppi:w-8 ppi:items-center ppi:justify-center ppi:rounded-none ppi:text-slate-300 hover:ppi:bg-[#515F6C] hover:ppi:text-white ppi:transition-colors"
                        >
                            <ExternalLink className="ppi:h-4 ppi:w-4" />
                        </a>
                    )}
                </div>
            </div>

            <div className="ppi:mt-4 ppi:flex ppi:justify-end">
                <button
                    type="button"
                    onClick={() => onInstall(plugin)}
                    className="ppi:flex ppi:items-center ppi:justify-center ppi:rounded-none ppi:bg-[#2964C3] ppi:h-[40px] ppi:min-w-[100px] sm:ppi:min-w-[120px] ppi:px-5 sm:ppi:px-6 ppi:py-2 ppi:text-xs sm:ppi:text-sm ppi:font-bold ppi:uppercase ppi:tracking-wider ppi:text-white hover:ppi:bg-[#2053a6] ppi:shadow-sm ppi:transition-all active:ppi:scale-95"
                >
                    INSTALL
                </button>
            </div>
        </div>
    );
}
