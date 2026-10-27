import { definePterodactylExtension } from '@pterodactyl/sdk';
import type { ExtensionSetupContext } from '@pterodactyl/sdk';
import './styles.css';

interface ServerAttributes {
    identifier?: string;
    uuid?: string;
    egg_id?: number | string;
    eggId?: number | string;
    egg_features?: string[] | null;
    eggFeatures?: string[] | null;
    tags?: string[] | null;
    egg_tags?: string[] | null;
    eggTags?: string[] | null;
    docker_image?: string;
    invocation?: string;
    name?: string;
    [key: string]: unknown;
}

interface ServerResource {
    id?: number | string;
    egg_id?: number | string;
    eggId?: number | string;
    attributes?: ServerAttributes;
    [key: string]: unknown;
}

interface ExtensionFrontendConfig {
    show_nav_tab?: boolean;
    allowed_egg_ids?: string;
    [key: string]: unknown;
}

interface ScreenContext {
    user?: unknown;
    config?: ExtensionFrontendConfig;
    server?: ServerResource;
    resource?: unknown;
}

function isScreenVisible(context: ScreenContext): boolean {
    const config = context.config;
    if (config?.show_nav_tab === false) {
        return false;
    }

    const rawAllowed = typeof config?.allowed_egg_ids === 'string' ? config.allowed_egg_ids.trim() : '';
    const server = context.server;
    const attr = server?.attributes;

    if (rawAllowed.length > 0) {
        const allowedTokens = rawAllowed
            .split(',')
            .map((token) => token.trim().toLowerCase())
            .filter((token) => token.length > 0);

        if (allowedTokens.length > 0) {
            const serverEggId = String(
                attr?.egg_id ??
                attr?.eggId ??
                server?.egg_id ??
                server?.eggId ??
                ''
            ).trim().toLowerCase();

            if (serverEggId.length > 0 && allowedTokens.includes(serverEggId)) {
                return true;
            }

            const features = (attr?.egg_features ?? attr?.eggFeatures ?? []).map((feature) => feature.toLowerCase());
            const tags = (attr?.tags ?? attr?.egg_tags ?? attr?.eggTags ?? []).map((tag) => tag.toLowerCase());
            const dockerImage = (attr?.docker_image ?? '').toLowerCase();
            const invocation = (attr?.invocation ?? '').toLowerCase();
            const serverName = (attr?.name ?? '').toLowerCase();

            return allowedTokens.some((token) =>
                features.includes(token) ||
                tags.includes(token) ||
                dockerImage.includes(token) ||
                invocation.includes(token) ||
                serverName.includes(token)
            );
        }
    }

    const eggFeatures = (attr?.egg_features ?? attr?.eggFeatures ?? []).map((feature) => feature.toLowerCase());
    return eggFeatures.some((feature) => feature === 'eula' || feature === 'java_version');
}

export default definePterodactylExtension({
    setup({ screens }: ExtensionSetupContext) {
        screens.register('plugins', () => import('./screens/PluginsScreen'), {
            visible: (context: ScreenContext) => isScreenVisible(context),
        });
    },
});
