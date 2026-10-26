export type PluginProvider = 'modrinth' | 'spigotmc' | 'curseforge' | 'hangar';

export type PluginSort = 'relevance' | 'downloads' | 'updated';

export interface PluginItem {
    id: string;
    name: string;
    short_description: string;
    url: string;
    icon_url: string | null;
    author?: string;
    downloads?: number;
    followers?: number;
    categories?: string[];
    last_updated?: string;
}

export interface PaginationMeta {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
}

export interface PluginSearchResponse {
    object: string;
    data: PluginItem[];
    meta: {
        pagination: PaginationMeta;
    };
}

export interface PluginVersionItem {
    id: string;
    name: string;
    game_versions?: string[];
    platforms?: string[];
    releaseDate?: number | null;
    downloads?: number | null;
    published_at?: string | null;
    url?: string | null;
}

export interface PluginProjectDetails {
    title?: string;
    name?: string;
    description?: string;
    icon_url?: string | null;
    downloads?: number;
    followers?: number | null;
    updated_at?: string;
    author?: string;
    categories?: string[];
    loaders?: string[];
    game_versions?: string[];
    url?: string;
}

export interface PluginVersionsResponse {
    project: PluginProjectDetails;
    versions: PluginVersionItem[];
}

export interface InstalledPluginFile {
    name: string;
    size: number;
    modifiedAt: string;
}

export interface SearchFilters {
    searchQuery: string;
    provider: PluginProvider;
    minecraftVersion: string;
    pluginLoader: string;
    perPage: number;
    sort: PluginSort;
}

export interface FilterOption {
    value: string;
    label: string;
}
