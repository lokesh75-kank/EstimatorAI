import { useState, useEffect } from 'react';
import { DataSource } from '@/types/dataSources';
import { dataSourcesApi } from '@/lib/api/data-sources';

export const useDataSources = () => {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSources = async () => {
    try {
      setIsLoading(true);
      const data = await dataSourcesApi.getAll();
      setSources(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data sources'));
    } finally {
      setIsLoading(false);
    }
  };

  const addSource = async (source: Omit<DataSource, 'id'>) => {
    try {
      const newSource = await dataSourcesApi.create(source);
      setSources((prev) => [...prev, newSource]);
      return newSource;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add data source');
    }
  };

  const updateSource = async (id: string, updates: Partial<DataSource>) => {
    try {
      const updatedSource = await dataSourcesApi.update(id, updates);
      setSources((prev) =>
        prev.map((source) => (source.id === id ? updatedSource : source))
      );
      return updatedSource;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update data source');
    }
  };

  const deleteSource = async (id: string) => {
    try {
      await dataSourcesApi.delete(id);
      setSources((prev) => prev.filter((source) => source.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete data source');
    }
  };

  const syncSource = async (id: string) => {
    try {
      const updatedSource = await dataSourcesApi.sync(id);
      setSources((prev) =>
        prev.map((source) => (source.id === id ? updatedSource : source))
      );
      return updatedSource;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to sync data source');
    }
  };

  const toggleSourceStatus = async (id: string) => {
    try {
      const updatedSource = await dataSourcesApi.toggleStatus(id);
      setSources((prev) =>
        prev.map((source) => (source.id === id ? updatedSource : source))
      );
      return updatedSource;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to toggle data source status');
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return {
    sources,
    isLoading,
    error,
    fetchSources,
    addSource,
    updateSource,
    deleteSource,
    syncSource,
    toggleSourceStatus,
  };
}; 