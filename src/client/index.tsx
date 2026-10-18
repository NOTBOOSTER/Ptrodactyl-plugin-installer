import { definePterodactylExtension } from '@pterodactyl/sdk';
import './styles.css';

export default definePterodactylExtension({
    setup({ screens }) {
        screens.register('plugins', () => import('./screens/PluginsScreen'));
    },
});
