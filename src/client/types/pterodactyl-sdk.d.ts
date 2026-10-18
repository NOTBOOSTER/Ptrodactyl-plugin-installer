declare module '@pterodactyl/sdk' {
    export interface SdkServerAttributes {
        id: number;
        uuid: string;
        identifier: string;
        name: string;
        node: string;
        is_node_under_maintenance: boolean;
        status: string | null;
        invocation: string;
        docker_image: string;
    }

    export interface SdkServer {
        object: string;
        attributes: SdkServerAttributes;
    }

    export interface ExtensionScreensRegistry {
        register(id: string, loader: () => Promise<{ default: import('react').ComponentType<unknown> }>): void;
    }

    export interface ExtensionSlotsRegistry {
        register(name: string, component: import('react').ComponentType<unknown>): void;
    }

    export interface ExtensionSetupContext {
        meta: { id: string; version: string };
        config: Record<string, unknown>;
        slots: ExtensionSlotsRegistry;
        screens: ExtensionScreensRegistry;
    }

    export interface ExtensionDefinition {
        setup(context: ExtensionSetupContext): void;
    }

    export function definePterodactylExtension(definition: ExtensionDefinition): ExtensionDefinition;

    export function useCurrentServerRequired(): SdkServer;

    export function useServerPermission(permission: string): boolean;

    export interface ServerContentBlockProps {
        title: string;
        children: import('react').ReactNode;
        className?: string;
    }
    export function ServerContentBlock(props: ServerContentBlockProps): import('react').JSX.Element;

    export interface SpinnerProps {
        centered?: boolean;
        className?: string;
    }
    export function Spinner(props?: SpinnerProps): import('react').JSX.Element;

    export const http: {
        get<T>(url: string, config?: Record<string, unknown>): Promise<{ data: T }>;
        post<T = void>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<{ data: T }>;
        put<T = void>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<{ data: T }>;
        delete<T = void>(url: string, config?: Record<string, unknown>): Promise<{ data: T }>;
    };

    export const toast: {
        success(message: string): void;
        error(message: string): void;
        info(message: string): void;
        warning(message: string): void;
    };

    export function httpErrorToHuman(error: unknown): string;
}

declare module '@pterodactyl/sdk/vite' {
    export interface ExtensionConfigOptions {
        entry?: string;
    }
    export function defineExtensionConfig(options?: ExtensionConfigOptions): unknown;
}

declare module '*.css' {
    const styles: Record<string, string>;
    export default styles;
}
