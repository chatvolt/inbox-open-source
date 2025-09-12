"use client";
import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";
import createCache from "@emotion/cache";
import { CacheProvider as EmotionCacheProvider } from "@emotion/react"; // Importação crucial
import type {
  EmotionCache,
  Options as OptionsOfCreateCache,
} from "@emotion/cache";

export type NextAppDirEmotionCacheProviderProps = {
  options: Omit<OptionsOfCreateCache, "insertionPoint">;
  children: React.ReactNode;
};

export default function NextAppDirEmotionCacheProvider(
  props: NextAppDirEmotionCacheProviderProps
) {
  const { options, children } = props;

  // Cria o cache apenas uma vez por instância do componente
  const [registry] = React.useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[0];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  // Renderiza os estilos inseridos no servidor
  useServerInsertedHTML(() => {
    const names = registry.flush();
    if (names.length === 0) {
      return null;
    }
    let styles = "";
    for (const name of names) {
      styles += registry.cache.inserted[name];
    }
    return (
      <style
        key={registry.cache.key}
        data-emotion={`${registry.cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  // A mudança principal está aqui: Usamos o CacheProvider importado diretamente
  return (
    <EmotionCacheProvider value={registry.cache}>
      {children}
    </EmotionCacheProvider>
  );
}