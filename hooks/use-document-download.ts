import { useState, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { supabase } from '@/lib/supabase';

export interface DownloadProgress {
  progress: number;
  loaded: number;
  total: number;
}

export function useDocumentDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getSignedUrl = useCallback(async (filePath: string): Promise<string | null> => {
    try {
      const { data, error: funcError } = await supabase.functions.invoke('get-signed-url', {
        body: { path: filePath },
      });

      if (funcError) {
        console.error('Erro ao obter URL assinada:', funcError);
        setError('Erro ao obter acesso ao documento');
        return null;
      }

      return data?.signedUrl || null;
    } catch (err) {
      console.error('Erro ao chamar Edge Function:', err);
      setError('Erro ao acessar o servidor');
      return null;
    }
  }, []);

  const downloadDocument = useCallback(
  async (url: string, fileName: string): Promise<boolean> => {
    setError(null);
    setIsDownloading(true);
    setDownloadProgress(null);

    try {
      const downloadPath = `${FileSystem.documentDirectory}${fileName}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url, // 🔥 agora é URL direta
        downloadPath,
        {},
        (progressEvent) => {
          const progress =
            progressEvent.totalBytesWritten /
            progressEvent.totalBytesExpectedToWrite;

          setDownloadProgress({
            progress,
            loaded: progressEvent.totalBytesWritten,
            total: progressEvent.totalBytesExpectedToWrite,
          });
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (!result) {
        setError('Erro ao fazer download do documento');
        return false;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Compartilhar ${fileName}`,
        });
      }

      return true;
    } catch (err) {
      console.error('Erro ao fazer download:', err);
      setError('Erro ao fazer download do documento');
      return false;
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  },
  []
);

  const openDocument = useCallback(
    async (filePath: string, fileName: string): Promise<boolean> => {
      setError(null);

      try {
        // Obter URL assinada
        const signedUrl = await getSignedUrl(filePath);
        if (!signedUrl) {
          return false;
        }

        // Abrir no navegador ou app padrão
        const canOpen = await Sharing.isAvailableAsync();
        if (canOpen) {
          // Para web, abrir em nova aba
          if (typeof window !== 'undefined') {
            window.open(signedUrl, '_blank');
            return true;
          }

          // Para mobile, fazer download e compartilhar
          return downloadDocument(filePath, fileName);
        }

        return false;
      } catch (err) {
        console.error('Erro ao abrir documento:', err);
        setError('Erro ao abrir documento');
        return false;
      }
    },
    [getSignedUrl, downloadDocument]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isDownloading,
    downloadProgress,
    error,
    downloadDocument,
    openDocument,
    clearError,
  };
}
