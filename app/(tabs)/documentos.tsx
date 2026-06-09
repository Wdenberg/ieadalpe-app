import React, { useState, useMemo, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import * as Notifications from "expo-notifications";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDocumentDownload } from "@/hooks/use-document-download";
import { PDFViewer } from "@/components/pdf-viewer";
import { cn } from "@/lib/utils";

// 🔥 1. IMPORTANDO O SEU NOVO SERVIÇO (Ajuste o caminho se necessário)
import {
  documentoService,
  Documento,
  CategoriaDocumento,
} from "@/services/documentosServices";

export default function DocumentosScreen({ userId }: { userId?: string }) {
  const colors = useColors();
  const queryClient = useQueryClient();

  const {
    isDownloading,
    downloadProgress,
    error: downloadError,
    downloadDocument,
    clearError,
  } = useDocumentDownload();

  const [selectedDocument, setSelectedDocument] = useState<Documento | null>(
    null,
  );
  const [viewerVisible, setViewerVisible] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // --- NOTIFICAÇÕES & REALTIME ---
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") await Notifications.requestPermissionsAsync();
    };
    setupNotifications();

    // 🔥 2. USANDO O SERVIÇO PARA ESCUTAR O BANCO
    const channel = documentoService.inscreverEmNovosDocumentos((novoDoc) => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: "📄 Novo Documento Disponível",
          body: `O documento "${novoDoc.titulo}" foi publicado.`,
          sound: true,
        },
        trigger: null,
      });

      // Atualiza a lista automaticamente
      queryClient.invalidateQueries({ queryKey: ["documentos", userId] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient, userId]);

  // --- BUSCA DE DADOS (React Query) ---
  const {
    data: documentos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["documentos", userId],
    // 🔥 3. O SERVIÇO FAZ A BUSCA PESADA
    queryFn: () => documentoService.getDocumentos(),
    enabled: true,
  });

  // --- LÓGICA DE CATEGORIZAÇÃO ---
  const categorizedDocumentos = useMemo(() => {
    // 🔥 4. O SERVIÇO CUIDA DA SEPARAÇÃO
    return documentoService.categorizarDocumentos(documentos);
  }, [documentos]);

  // --- HELPERS ---
  const handleOpenDocument = async (documento: Documento) => {
    // 🔥 5. O SERVIÇO GERA A URL ASSINADA
    const signedUrl = await documentoService.getSignedUrl(
      documento.arquivo_url,
    );
    if (!signedUrl) return;

    setSelectedDocument({ ...documento, arquivo_url: signedUrl });
    setViewerVisible(true);
  };

  const handleDownload = async (documento: Documento) => {
    try {
      setDownloadingId(documento.id);

      // 🔥 6. REAPROVEITANDO A FUNÇÃO DE URL ASSINADA
      const signedUrl = await documentoService.getSignedUrl(
        documento.arquivo_url,
      );
      if (!signedUrl) return;

      await downloadDocument(signedUrl, `${documento.titulo}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  // --- RENDER (Permanece igualzinho) ---
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
        <View className="bg-primary px-6 py-8 items-center rounded-b-[32px] shadow-lg">
          <Text className="text-2xl font-extrabold text-white">Documentos</Text>
          <Text className="text-white/80 text-xs mt-1">
            Acesso restrito para obreiros
          </Text>
        </View>

        <View className="px-6 py-6 gap-6">
          {downloadError && (
            <View className="bg-red-100 border border-red-400 rounded-lg p-3 flex-row justify-between">
              <Text className="text-red-700 text-sm flex-1">
                {downloadError}
              </Text>
              <TouchableOpacity onPress={clearError}>
                <Text className="font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {categorizedDocumentos.length === 0 && (
            <Text className="text-center text-muted mt-10 italic">
              Nenhum documento disponível
            </Text>
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
                <View
                  key={doc.id}
                  className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm"
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleOpenDocument(doc)}
                    className="p-4"
                  >
                    <Text className="text-base font-bold text-foreground">
                      {doc.titulo}
                    </Text>
                    {doc.descricao ? (
                      <Text className="text-xs text-muted mt-1">
                        {doc.descricao}
                      </Text>
                    ) : null}
                    <Text className="text-[10px] text-muted mt-3 uppercase font-medium">
                      Publicado em:{" "}
                      {new Date(doc.created_at).toLocaleDateString("pt-BR")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDownload(doc)}
                    disabled={isDownloading && downloadingId === doc.id}
                    className={cn(
                      "py-3 flex-row justify-center items-center gap-2 border-t border-border",
                      isDownloading && downloadingId === doc.id
                        ? "bg-muted"
                        : "bg-tertiary",
                    )}
                  >
                    {isDownloading && downloadingId === doc.id ? (
                      <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                      <Text className="text-primary font-bold text-sm">
                        ⬇ Baixar Arquivo
                      </Text>
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
