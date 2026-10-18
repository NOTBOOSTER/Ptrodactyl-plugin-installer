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
            className="mpi:group mpi:flex mpi:flex-col mpi:justify-between mpi:rounded-xl mpi:border mpi:border-neutral-700 mpi:bg-neutral-800/80 mpi:p-4 mpi:transition-all mpi:duration-200 hover:mpi:-translate-y-0.5 hover:mpi:border-neutral-500 hover:mpi:bg-neutral-800 hover:mpi:shadow-lg mpi:cursor-pointer"
        >
            <div>
                <div className="mpi:flex mpi:items-start mpi:gap-3.5">
                    {plugin.icon_url ? (
                        <img
                            src={plugin.icon_url}
                            alt={plugin.name}
                            className="mpi:h-14 mpi:w-14 mpi:shrink-0 mpi:rounded-lg mpi:border mpi:border-neutral-600 mpi:bg-neutral-900 mpi:object-cover"
                            onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="mpi:flex mpi:h-14 mpi:w-14 mpi:shrink-0 mpi:items-center mpi:justify-center mpi:rounded-lg mpi:border mpi:border-neutral-600 mpi:bg-neutral-900 mpi:text-neutral-400">
                            <Package className="mpi:h-7 mpi:w-7" />
                        </div>
                    )}

                    <div className="mpi:min-w-0 mpi:flex-1">
                        <div className="mpi:flex mpi:items-center mpi:justify-between mpi:gap-2">
                            <h3 className="mpi:truncate mpi:text-base mpi:font-semibold mpi:text-white group-hover:mpi:text-blue-400 mpi:transition-colors">
                                {plugin.name}
                            </h3>
                            {plugin.url && (
                                <a
                                    href={plugin.url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    onClick={(e) => e.stopPropagation()}
                                    title="View on source website"
                                    className="mpi:rounded mpi:p-1 mpi:text-neutral-400 hover:mpi:bg-neutral-700 hover:mpi:text-neutral-200"
                                >
                                    <ExternalLink className="mpi:h-4 mpi:w-4" />
                                </a>
                            )}
                        </div>

                        {plugin.author && (
                            <p className="mpi:text-xs mpi:font-medium mpi:text-neutral-400">
                                by <span className="mpi:text-neutral-300">{plugin.author}</span>
                            </p>
                        )}
                    </div>
                </div>

                <p className="mpi:mt-3 mpi:line-clamp-2 mpi:text-xs mpi:text-neutral-300">
                    {plugin.short_description || 'No description provided.'}
                </p>

                {plugin.categories && plugin.categories.length > 0 && (
                    <div className="mpi:mt-3 mpi:flex mpi:flex-wrap mpi:gap-1.5">
                        {plugin.categories.slice(0, 3).map((category) => (
                            <span
                                key={category}
                                className="mpi:rounded-md mpi:bg-neutral-700/60 mpi:px-2 mpi:py-0.5 mpi:text-[10px] mpi:font-medium mpi:text-neutral-300"
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="mpi:mt-4 mpi:flex mpi:items-center mpi:justify-between mpi:border-t mpi:border-neutral-700/60 mpi:pt-3 mpi:text-xs mpi:text-neutral-400">
                <div className="mpi:flex mpi:items-center mpi:gap-3">
                    <span className="mpi:flex mpi:items-center mpi:gap-1" title="Total downloads">
                        <Download className="mpi:h-3.5 mpi:w-3.5" />
                        <span>{formattedDownloads}</span>
                    </span>

                    {plugin.followers !== undefined && plugin.followers !== null && (
                        <span className="mpi:flex mpi:items-center mpi:gap-1" title="Rating / Stars">
                            <ThumbsUp className="mpi:h-3.5 mpi:w-3.5" />
                            <span>{plugin.followers.toLocaleString()}</span>
                        </span>
                    )}
                </div>

                {formattedDate && (
                    <span className="mpi:flex mpi:items-center mpi:gap-1 mpi:text-[11px]" title="Last updated">
                        <Calendar className="mpi:h-3 mpi:w-3" />
                        <span>{formattedDate}</span>
                    </span>
                )}
            </div>
        </div>
    );
}
