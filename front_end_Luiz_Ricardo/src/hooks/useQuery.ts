import React, { useCallback } from "react";

const useQuery = <T>(key: string, url: string, options?: RequestInit): readonly [T | undefined, Error | null, boolean, () => void] => {
  const [data, setData] = React.useState<T>();
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  // ALTERADO: useCallback para memorizar a função e evitar re-renderizações desnecessárias
  const fetchData = useCallback(async () => {
    if (!url) {
      setData(undefined);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(url, { ...options, cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
      setError(null); // Limpa erros anteriores em caso de sucesso
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]); // Dependências da função

  React.useEffect(() => {
    fetchData();
  }, [key, fetchData]); // A busca é refeita se a 'key' ou a própria função 'fetchData' mudar

  // ALTERADO: Retorna a função fetchData para que possa ser chamada externamente
  return [data, error, loading, fetchData] as const;
};

export default useQuery;