import { definePterodactylExtension } from '@pterodactyl/sdk';
import type { ExtensionSetupContext } from '@pterodactyl/sdk';
import './styles.css';

export default definePterodactylExtension({
    setup({ screens }: ExtensionSetupContext) {
        screens.register('plugins', () => import('./screens/PluginsScreen'));
    },
});
