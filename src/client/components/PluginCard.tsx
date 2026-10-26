import React from 'react';
import { Download, ExternalLink, Heart, Info, Package, User } from 'lucide-react';
import type { PluginItem } from '../types';

interface PluginCardProps {
    plugin: PluginItem;
    onViewDetails: (plugin: PluginItem) => void;
    onInstall: (plugin: PluginItem) => void;
}

export function PluginCard({ plugin, onViewDetails, onInstall }: PluginCardProps): React.JSX.Element {
    const formattedDownloads = plugin.downloads !== undefined && plugin.downloads !== null
        ? Number(plugin.downloads).toLocaleString()
        : '0';

    const formattedFollowers = plugin.followers !== undefined && plugin.followers !== null
        ? Number(plugin.followers).toLocaleString()
        : null;

    return (
        <div className="ppi:group ppi:flex ppi:flex-col ppi:justify-between ppi:rounded-2xl ppi:border ppi:border-neutral-700/60 ppi:bg-[#18202c]/90 hover:ppi:bg-[#1b2432] hover:ppi:border-neutral-600/80 ppi:p-4 ppi:transition-all ppi:duration-200 hover:ppi:shadow-xl">
            <div>
                <div className="ppi:flex ppi:items-start ppi:gap-3.5">
                    {plugin.icon_url ? (
                        <img
                            src={plugin.icon_url}
                            alt={plugin.name}
                            className="ppi:h-14 ppi:w-14 ppi:shrink-0 ppi:rounded-xl ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-950 ppi:object-cover"
                            onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="ppi:flex ppi:h-14 ppi:w-14 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-xl ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-950 ppi:text-neutral-400">
                            <Package className="ppi:h-7 ppi:w-7" />
                        </div>
                    )}

                    <div className="ppi:min-w-0 ppi:flex-1">
                        <h3
                            onClick={() => onViewDetails(plugin)}
                            className="ppi:truncate ppi:text-sm sm:ppi:text-base ppi:font-bold ppi:text-white group-hover:ppi:text-blue-400 ppi:cursor-pointer ppi:transition-colors"
                            title={plugin.name}
                        >
                            {plugin.name}
                        </h3>

                        <div className="ppi:mt-1 ppi:flex ppi:items-center ppi:gap-2.5 ppi:text-xs ppi:text-neutral-400">
                            <span className="ppi:flex ppi:items-center ppi:gap-1" title="Downloads">
                                <Download className="ppi:h-3.5 ppi:w-3.5 ppi:text-neutral-500" />
                                <span>{formattedDownloads}</span>
                            </span>

                            {formattedFollowers !== null && (
                                <span className="ppi:flex ppi:items-center ppi:gap-1" title="Likes / Stars">
                                    <Heart className="ppi:h-3.5 ppi:w-3.5 ppi:text-red-400/80" />
                                    <span>{formattedFollowers}</span>
                                </span>
                            )}
                        </div>

                        {plugin.author && (
                            <div className="ppi:mt-0.5 ppi:flex ppi:items-center ppi:gap-1 ppi:text-xs ppi:text-neutral-400">
                                <User className="ppi:h-3 ppi:w-3 ppi:text-neutral-500" />
                                <span className="ppi:truncate">by {plugin.author}</span>
                            </div>
                        )}
                    </div>
                </div>

                <p className="ppi:mt-3 ppi:line-clamp-2 ppi:text-xs ppi:leading-relaxed ppi:text-neutral-300">
                    {plugin.short_description || 'No description provided.'}
                </p>
            </div>

            <div className="ppi:mt-4 ppi:flex ppi:items-center ppi:justify-between ppi:border-t ppi:border-neutral-700/40 ppi:pt-3">
                {plugin.url ? (
                    <a
                        href={plugin.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        title="View on source website"
                        className="ppi:flex ppi:h-8 ppi:w-8 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:border ppi:border-neutral-700/70 ppi:bg-neutral-800/80 ppi:text-neutral-400 hover:ppi:border-neutral-600 hover:ppi:bg-neutral-700 hover:ppi:text-white ppi:transition-colors"
                    >
                        <ExternalLink className="ppi:h-4 ppi:w-4" />
                    </a>
                ) : (
                    <div />
                )}

                <div className="ppi:flex ppi:items-center ppi:gap-2">
                    <button
                        type="button"
                        onClick={() => onViewDetails(plugin)}
                        className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-lg ppi:border ppi:border-neutral-700/80 ppi:bg-neutral-800/90 ppi:px-3 ppi:py-1.5 ppi:text-xs ppi:font-medium ppi:text-neutral-200 hover:ppi:bg-neutral-700 hover:ppi:text-white ppi:transition-colors"
                    >
                        <Info className="ppi:h-3.5 ppi:w-3.5 ppi:text-blue-400" />
                        <span>Details</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onInstall(plugin)}
                        className="ppi:flex ppi:items-center ppi:gap-1.5 ppi:rounded-lg ppi:bg-blue-600 ppi:px-3.5 ppi:py-1.5 ppi:text-xs ppi:font-semibold ppi:text-white hover:ppi:bg-blue-500 ppi:shadow-sm ppi:transition-all active:ppi:scale-95"
                    >
                        <Download className="ppi:h-3.5 ppi:w-3.5" />
                        <span>Install</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
