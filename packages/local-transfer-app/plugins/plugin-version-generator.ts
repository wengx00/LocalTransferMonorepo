export default function versionGenerator(options: { version: string; name?: string; id?: string }) {
  const { version, name = 'plugin-generator', id = 'app-version' } = options;
  return {
    name,
    enforce: 'pre' as const,

    resolveId(resource: string) {
      if (id === resource) return id;
      return null;
    },

    load(id: string) {
      if (id !== 'app-version') return null;
      return `const VERSION = '${version}'\nexport default VERSION\n`;
    }
  };
}
