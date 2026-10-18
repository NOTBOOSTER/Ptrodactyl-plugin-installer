import { http } from '@pterodactyl/sdk';
import type {
    PluginProvider,
    PluginSearchResponse,
    PluginVersionsResponse,
    SearchFilters,
} from './types';

const baseUrl = (server: string) => `/api/client/servers/${server}/extensions/minecraft-plugin-installer/plugins`;

export async function searchPlugins(
    serverIdentifier: string,
    page: number,
    filters: SearchFilters
): Promise<PluginSearchResponse> {
    const { data } = await http.get<PluginSearchResponse>(baseUrl(serverIdentifier), {
        params: {
            page,
            page_size: filters.perPage,
            provider: filters.provider,
            search_query: filters.searchQuery || undefined,
            minecraft_version: filters.minecraftVersion || undefined,
            plugin_loader: filters.pluginLoader || undefined,
            sort: filters.sort,
        },
    });

    return data;
}

export async function getMinecraftVersions(
    serverIdentifier: string,
    provider: PluginProvider
): Promise<string[]> {
    const { data } = await http.get<string[]>(`${baseUrl(serverIdentifier)}/minecraft-versions`, {
        params: { provider },
    });

    return data;
}

export async function getPluginLoaders(
    serverIdentifier: string,
    provider: PluginProvider
): Promise<string[]> {
    const { data } = await http.get<string[]>(`${baseUrl(serverIdentifier)}/loaders`, {
        params: { provider },
    });

    return data;
}

export async function getInstalledPlugins(
    serverIdentifier: string
): Promise<{ identified: Array<{ id: string; project_id: string; name: string; provider: string }>; other: string[] }> {
    const { data } = await http.get<{
        identified: Array<{ id: string; project_id: string; name: string; provider: string }>;
        other: string[];
    }>(`${baseUrl(serverIdentifier)}/installed`);

    return data;
}

export async function getPluginVersions(
    serverIdentifier: string,
    pluginId: string,
    provider: PluginProvider,
    pluginLoader?: string,
    minecraftVersion?: string
): Promise<PluginVersionsResponse> {
    const { data } = await http.get<PluginVersionsResponse>(`${baseUrl(serverIdentifier)}/${pluginId}/versions`, {
        params: {
            provider,
            plugin_loader: pluginLoader || undefined,
            minecraft_version: minecraftVersion || undefined,
        },
    });

    return data;
}

export async function installPlugin(
    serverIdentifier: string,
    pluginId: string,
    versionId: string,
    provider: PluginProvider
): Promise<void> {
    await http.post(`${baseUrl(serverIdentifier)}/install`, {
        plugin_id: pluginId,
        version: versionId,
        provider,
    });
}
