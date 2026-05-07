import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as Notifications from 'expo-notifications'; // 1. Importação
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query'; // Adicionei useQueryClient
import { useDocumentDownload } from '@/hooks/use-document-download';
import { PDFViewer } from '@/components/pdf-viewer';
import { cn } from '@/lib/utils';

// --- Tipagens ---
interface Documento {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  arquivo_url: string;
  created_at: string;
  visibilidade: string;
}

export default function DocumentosScreen({ userId }: { userId?: string }) {
  const colors = useColors();
  const queryClient = useQueryClient(); // Para atualizar a lista automaticamente

  const {
    isDownloading,
    downloadProgress,
    error: downloadError,
    downloadDocument,
    clearError,
  } = useDocumentDownload();

  const [selectedDocument, setSelectedDocument] = useState<Documento | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // --- NOTIFICAÇÕES & REALTIME ---
  useEffect(() => {
    // Solicitar permissão
    const setupNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') await Notifications.requestPermissionsAsync();
    };
    setupNotifications();

    // Escutar novos documentos
    const channel = supabase
      .channel('documentos_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'documentos' },
        (payload) => {
          const novoDoc = payload.new as Documento;

          // Só notifica se for visível para o obreiro
          if (['obreiros', 'publico'].includes(novoDoc.visibilidade)) {
            // Disparar Alerta
            Notifications.scheduleNotificationAsync({
              content: {
                title: "📄 Novo Documento Disponível",
                body: `O documento "${novoDoc.titulo}" foi publicado.`,
                sound: true,
              },
              trigger: null,
            });

            // Atualiza a lista do React Query automaticamente
            queryClient.invalidateQueries({ queryKey: ['documentos'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // --- BUSCA DE DADOS (React Query) ---
  const {
    data: documentos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documentos', userId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('documentos')
        .select('id, titulo, tipo, arquivo_url, created_at, descricao, visibilidade')
        .in('visibilidade', ['obreiros', 'publico'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: true,
  });

  // --- LÓGICA DE CATEGORIZAÇÃO ---
  const categorizedDocumentos = useMemo(() => {
    return documentos.reduce((acc, doc) => {
      const existing = acc.find((item) => item.categoria === doc.tipo);
      if (existing) {
        existing.docs.push(doc);
      } else {
        acc.push({ categoria: doc.tipo, docs: [doc] });
      }
      return acc;
    }, [] as Array<{ categoria: string; docs: Documento[] }>);
  }, [documentos]);

  // --- HELPERS ---
  const getSignedUrl = async (path: string) => {
    const cleanPath = path.replace('private://', '').trim();
    const { data, error } = await supabase.storage
      .from('media-private')
      .createSignedUrl(cleanPath, 3600);

    if (error) {
      console.error('Erro ao gerar URL:', error);
      return null;
    }
    return data?.signedUrl;
  };

  const handleOpenDocument = async (documento: Documento) => {
    const signedUrl = await getSignedUrl(documento.arquivo_url);
    if (!signedUrl) return;
    setSelectedDocument({ ...documento, arquivo_url: signedUrl });
    setViewerVisible(true);
  };

  const handleDownload = async (documento: Documento) => {
    try {
      setDownloadingId(documento.id);
      const signedUrl = await getSignedUrl(documento.arquivo_url);
      if (!signedUrl) return;
      await downloadDocument(signedUrl, `${documento.titulo}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-red-500">Erro ao carregar documentos</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View
          className="bg-primary px-6 py-8 items-center rounded-b-[32px] shadow-lg"
        >
          <Text className="text-2xl font-extrabold text-white">Documentos</Text>
          <Text className="text-white/80 text-xs mt-1">Acesso restrito para obreiros</Text>
        </View>

        <View className="px-6 py-6 gap-6">
          {downloadError && (
            <View className="bg-red-100 border border-red-400 rounded-lg p-3 flex-row justify-between">
              <Text className="text-red-700 text-sm flex-1">{downloadError}</Text>
              <TouchableOpacity onPress={clearError}><Text className="font-bold">✕</Text></TouchableOpacity>
            </View>
          )}

          {categorizedDocumentos.length === 0 && (
            <Text className="text-center text-muted mt-10 italic">Nenhum documento disponível</Text>
          )}

          {categorizedDocumentos.map((group) => (
            <View key={group.categoria} className="gap-3">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-xs font-black text-primary uppercase tracking-widest">
                  {group.categoria}
                </Text>
                <View className="flex-1 h-[1px] bg-border" />
              </View>

              {group.docs.map((doc) => (
                <View key={doc.id} className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleOpenDocument(doc)}
                    className="p-4"
                  >
                    <Text className="text-base font-bold text-foreground">{doc.titulo}</Text>
                    {doc.descricao ? <Text className="text-xs text-muted mt-1">{doc.descricao}</Text> : null}
                    <Text className="text-[10px] text-muted mt-3 uppercase font-medium">
                      Publicado em: {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDownload(doc)}
                    disabled={isDownloading && downloadingId === doc.id}
                    className={cn(
                      "py-3 flex-row justify-center items-center gap-2 border-t border-border",
                      isDownloading && downloadingId === doc.id ? "bg-muted" : "bg-tertiary"
                    )}
                  >
                    {isDownloading && downloadingId === doc.id ? (
                      <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                      <Text className="text-primary font-bold text-sm">⬇ Baixar Arquivo</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={viewerVisible} animationType="slide">
        {selectedDocument && (
          <PDFViewer
            uri={selectedDocument.arquivo_url}
            fileName={selectedDocument.titulo}
            onClose={() => setViewerVisible(false)}
          />
        )}
      </Modal>
    </ScreenContainer>
  );
}