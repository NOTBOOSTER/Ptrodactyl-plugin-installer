import React from 'react';
import { Download, ExternalLink, ThumbsUp, Calendar, Package } from 'lucide-react';
import type { PluginItem } from '../types';

interface PluginCardProps {
    plugin: PluginItem;
    onSelect: (plugin: PluginItem) => void;
}

export function PluginCard({ plugin, onSelect }: PluginCardProps): React.JSX.Element {
    const formattedDownloads = plugin.downloads !== undefined && plugin.downloads !== null
        ? Number(plugin.downloads).toLocaleString()
        : '0';

    const formattedDate = plugin.last_updated
        ? new Date(plugin.last_updated).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : null;

    return (
        <div
            onClick={() => onSelect(plugin)}
            className="ppi:group ppi:flex ppi:flex-col ppi:justify-between ppi:rounded-xl ppi:border ppi:border-neutral-700 ppi:bg-neutral-800/80 ppi:p-4 ppi:transition-all ppi:duration-200 hover:ppi:-translate-y-0.5 hover:ppi:border-neutral-500 hover:ppi:bg-neutral-800 hover:ppi:shadow-lg ppi:cursor-pointer"
        >
            <div>
                <div className="ppi:flex ppi:items-start ppi:gap-3.5">
                    {plugin.icon_url ? (
                        <img
                            src={plugin.icon_url}
                            alt={plugin.name}
                            className="ppi:h-14 ppi:w-14 ppi:shrink-0 ppi:rounded-lg ppi:border ppi:border-neutral-600 ppi:bg-neutral-900 ppi:object-cover"
                            onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="ppi:flex ppi:h-14 ppi:w-14 ppi:shrink-0 ppi:items-center ppi:justify-center ppi:rounded-lg ppi:border ppi:border-neutral-600 ppi:bg-neutral-900 ppi:text-neutral-400">
                            <Package className="ppi:h-7 ppi:w-7" />
                        </div>
                    )}

                    <div className="ppi:min-w-0 ppi:flex-1">
                        <div className="ppi:flex ppi:items-center ppi:justify-between ppi:gap-2">
                            <h3 className="ppi:truncate ppi:text-base ppi:font-semibold ppi:text-white group-hover:ppi:text-blue-400 ppi:transition-colors">
                                {plugin.name}
                            </h3>
                            {plugin.url && (
                                <a
                                    href={plugin.url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    onClick={(e) => e.stopPropagation()}
                                    title="View on source website"
                                    className="ppi:rounded ppi:p-1 ppi:text-neutral-400 hover:ppi:bg-neutral-700 hover:ppi:text-neutral-200"
                                >
                                    <ExternalLink className="ppi:h-4 ppi:w-4" />
                                </a>
                            )}
                        </div>

                        {plugin.author && (
                            <p className="ppi:text-xs ppi:font-medium ppi:text-neutral-400">
                                by <span className="ppi:text-neutral-300">{plugin.author}</span>
                            </p>
                        )}
                    </div>
                </div>

                <p className="ppi:mt-3 ppi:line-clamp-2 ppi:text-xs ppi:text-neutral-300">
                    {plugin.short_description || 'No description provided.'}
                </p>

                {plugin.categories && plugin.categories.length > 0 && (
                    <div className="ppi:mt-3 ppi:flex ppi:flex-wrap ppi:gap-1.5">
                        {plugin.categories.slice(0, 3).map((category) => (
                            <span
                                key={category}
                                className="ppi:rounded-md ppi:bg-neutral-700/60 ppi:px-2 ppi:py-0.5 ppi:text-[10px] ppi:font-medium ppi:text-neutral-300"
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="ppi:mt-4 ppi:flex ppi:items-center ppi:justify-between ppi:border-t ppi:border-neutral-700/60 ppi:pt-3 ppi:text-xs ppi:text-neutral-400">
                <div className="ppi:flex ppi:items-center ppi:gap-3">
                    <span className="ppi:flex ppi:items-center ppi:gap-1" title="Total downloads">
                        <Download className="ppi:h-3.5 ppi:w-3.5" />
                        <span>{formattedDownloads}</span>
                    </span>

                    {plugin.followers !== undefined && plugin.followers !== null && (
                        <span className="ppi:flex ppi:items-center ppi:gap-1" title="Rating / Stars">
                            <ThumbsUp className="ppi:h-3.5 ppi:w-3.5" />
                            <span>{plugin.followers.toLocaleString()}</span>
                        </span>
                    )}
                </div>

                {formattedDate && (
                    <span className="ppi:flex ppi:items-center ppi:gap-1 ppi:text-[11px]" title="Last updated">
                        <Calendar className="ppi:h-3 ppi:w-3" />
                        <span>{formattedDate}</span>
                    </span>
                )}
            </div>
        </div>
    );
}
