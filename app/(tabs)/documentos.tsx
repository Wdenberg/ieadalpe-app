import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useDocumentDownload } from '@/hooks/use-document-download';
import { PDFViewer } from '@/components/pdf-viewer';
import { cn } from '@/lib/utils';

interface Documento {
  id: string;
  nome: string;
  categoria: string;
  url: string;
  data_upload: string;
}

export default function DocumentosScreen() {
  const colors = useColors();
  const { isDownloading, downloadProgress, error: downloadError, downloadDocument, openDocument, clearError } = useDocumentDownload();
  const [documentos, setDocumentos] = useState<Documento[]>([
    {
      id: '1',
      nome: 'Manual do Obreiro',
      categoria: 'Manuais',
      url: 'https://example.com/manual.pdf',
      data_upload: '2024-01-15',
    },
    {
      id: '2',
      nome: 'Escala de Cultos - Abril',
      categoria: 'Escalas Impressas',
      url: 'https://example.com/escala-abril.pdf',
      data_upload: '2024-04-01',
    },
    {
      id: '3',
      nome: 'Comunicado Importante',
      categoria: 'Comunicados',
      url: 'https://example.com/comunicado.pdf',
      data_upload: '2024-04-20',
    },
  ]);
  const [selectedDocument, setSelectedDocument] = useState<Documento | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (documento: Documento) => {
    setDownloadingId(documento.id);
    const success = await downloadDocument(documento.url, documento.nome);
    if (success) {
      // Mostrar mensagem de sucesso
      console.log('Download concluído:', documento.nome);
    }
    setDownloadingId(null);
  };

  const handleOpenDocument = async (documento: Documento) => {
    setSelectedDocument(documento);
    setViewerVisible(true);
    // Aqui você pode chamar openDocument se quiser abrir em um app externo
    // await openDocument(documento.url, documento.nome);
  };

  const handleCloseViewer = () => {
    setViewerVisible(false);
    setSelectedDocument(null);
  };

  const categorizedDocumentos = documentos.reduce((acc, doc) => {
    const existing = acc.find(item => item.categoria === doc.categoria);
    if (existing) {
      existing.docs.push(doc);
    } else {
      acc.push({ categoria: doc.categoria, docs: [doc] });
    }
    return acc;
  }, [] as Array<{ categoria: string; docs: Documento[] }>);

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-primary px-6 py-6">
          <Text className="text-2xl font-bold text-surface">Documentos Restritos</Text>
          <Text className="text-sm text-surface/70 mt-1">
            Acesso exclusivo para obreiros
          </Text>
        </View>

        {/* Content */}
        <View className="px-6 py-6 gap-6">
          {/* Error Message */}
          {downloadError && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <View className="flex-row justify-between items-start">
                <Text className="text-error text-sm flex-1">{downloadError}</Text>
                <TouchableOpacity onPress={clearError}>
                  <Text className="text-error font-bold">✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Categorized Documents */}
          {categorizedDocumentos.map((group) => (
            <View key={group.categoria} className="gap-3">
              {/* Category Header */}
              <View className="flex-row items-center gap-2">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-xs font-bold text-primary px-2 uppercase">
                  {group.categoria}
                </Text>
                <View className="flex-1 h-px bg-border" />
              </View>

              {/* Documents in Category */}
              {group.docs.map((documento) => (
                <View key={documento.id} className="gap-2">
                  {/* Document Card */}
                  <TouchableOpacity
                    onPress={() => handleOpenDocument(documento)}
                    disabled={isDownloading && downloadingId === documento.id}
                    className="bg-surface rounded-lg p-4 border border-border active:opacity-70"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-xs text-warning font-semibold mb-1">
                          📄 {documento.categoria}
                        </Text>
                        <Text className="text-base font-bold text-foreground">
                          {documento.nome}
                        </Text>
                        <Text className="text-xs text-muted mt-2">
                          Enviado em {new Date(documento.data_upload).toLocaleDateString('pt-BR')}
                        </Text>
                      </View>
                      <View className="bg-primary rounded-full p-2 ml-2">
                        <Text className="text-surface font-bold">👁</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Download Button */}
                  <TouchableOpacity
                    onPress={() => handleDownload(documento)}
                    disabled={isDownloading && downloadingId === documento.id}
                    className={cn(
                      'rounded-lg py-3 items-center justify-center flex-row gap-2',
                      isDownloading && downloadingId === documento.id
                        ? 'bg-success/50'
                        : 'bg-success'
                    )}
                  >
                    {isDownloading && downloadingId === documento.id ? (
                      <>
                        <ActivityIndicator color={colors.surface} size="small" />
                        <Text className="text-surface font-semibold text-sm">
                          {downloadProgress
                            ? `${Math.round(downloadProgress.progress * 100)}%`
                            : 'Baixando...'}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text className="text-lg">⬇</Text>
                        <Text className="text-surface font-semibold">Baixar Documento</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}

          {/* Security Warning */}
          <View className="bg-warning/10 border border-warning rounded-lg p-4 mt-4">
            <Text className="text-xs text-warning font-semibold mb-1">⚠️ Aviso de Segurança</Text>
            <Text className="text-xs text-warning">
              Os documentos possuem acesso restrito com URLs temporárias (1 hora de validade). Baixe e guarde em local seguro se precisar de acesso permanente.
            </Text>
          </View>

          {/* Info */}
          <View className="bg-primary/10 border border-primary rounded-lg p-4">
            <Text className="text-xs text-primary font-semibold mb-1">ℹ️ Como usar</Text>
            <Text className="text-xs text-primary">
              • Toque no documento para visualizar{'\n'}
              • Use o botão "Baixar" para fazer download{'\n'}
              • Documentos expiram em 1 hora
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* PDF Viewer Modal */}
      <Modal
        visible={viewerVisible}
        animationType="slide"
        onRequestClose={handleCloseViewer}
      >
        {selectedDocument && (
          <PDFViewer
            uri={selectedDocument.url}
            fileName={selectedDocument.nome}
            onClose={handleCloseViewer}
          />
        )}
      </Modal>
    </ScreenContainer>
  );
}
