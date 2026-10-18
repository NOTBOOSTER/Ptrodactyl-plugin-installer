import { defineConfig } from 'vite';

const SHARED_RUNTIME_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@tanstack/react-query',
  '@pterodactyl/sdk',
  '@pterodactyl/sdk/api',
  '@pterodactyl/sdk/theme',
];

const extensionStyles = () => ({
  name: 'pterodactyl-extension-styles',
  enforce: 'post',
  generateBundle(_options, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type !== 'chunk' || !chunk.isEntry) continue;
      const styles = new Set();
      const visited = new Set();
      const collect = (file) => {
        if (visited.has(file)) return;
        visited.add(file);
        const dependency = bundle[file];
        if (dependency?.type !== 'chunk') return;
        for (const imported of dependency.imports) collect(imported);
        for (const style of dependency.viteMetadata?.importedCss ?? []) styles.add(style);
      };
      collect(chunk.fileName);
      if (!styles.size) continue;
      const prelude = `await Promise.all(${JSON.stringify([...styles])}.map(file => new Promise((resolve, reject) => {\n    const link = document.createElement('link');\n    link.rel = 'stylesheet';\n    link.href = new URL(file, import.meta.url).href;\n    link.onload = () => resolve();\n    link.onerror = () => { link.remove(); reject(new Error('Unable to load extension stylesheet: ' + file)); };\n    document.head.append(link);\n})));\n`;
      chunk.code = prelude + chunk.code;
      const sourceMap = bundle[`${chunk.fileName}.map`];
      if (sourceMap?.type === 'asset') {
        const map = JSON.parse(String(sourceMap.source));
        map.mappings = ';'.repeat(prelude.split('\n').length - 1) + map.mappings;
        sourceMap.source = JSON.stringify(map);
      }
    }
  },
});

export default defineConfig({
  plugins: [extensionStyles()],
  base: './',
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2022',
    modulePreload: false,
    rollupOptions: {
      input: 'src/client/index.tsx',
      external: SHARED_RUNTIME_MODULES,
      preserveEntrySignatures: 'strict',
      output: {
        format: 'es',
        entryFileNames: 'client.js',
        chunkFileNames: 'chunk.[name].[hash].js',
        assetFileNames: '[name].[hash][extname]',
      },
    },
  },
});
