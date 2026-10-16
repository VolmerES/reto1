import {stat} from 'node:fs/promises';

// Punto de carga opcional. La rúbrica y el evaluador no forman parte del starter.
export function createEvaluationLoader(file, options) {
  let active = null, stamp = '';
  return {
    get running() { return active?.running === true; },
    async load() {
      // Mantener la exclusión hasta acabar aunque se retire el archivo durante una prueba.
      if (active?.running) return active;
      let info;
      try { info = await stat(file); }
      catch (error) {
        if (error.code !== 'ENOENT') throw error;
        active = null; stamp = ''; return null;
      }
      const next = info.mtimeMs + ':' + info.size;
      if (!active || stamp !== next) {
        const url = new URL(file); url.searchParams.set('version', next);
        const module = await import(url.href);
        if (typeof module.createEvaluator !== 'function') throw Error('evaluar.mjs no exporta createEvaluator.');
        active = module.createEvaluator(options);
        stamp = next;
      }
      return active;
    },
  };
}
