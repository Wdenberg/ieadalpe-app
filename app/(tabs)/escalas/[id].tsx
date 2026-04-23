import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useDocumentDownload } from '@/hooks/use-document-download';
import { PDFViewer } from '@/components/pdf-viewer';
import { cn } from '@/lib/utils';

interface EscalaDetalhada {
  id: string;
  data_culto: string;
  hora_inicio: string;
  hora_fim?: string;
  tipo_culto: string;
  local: string;
  funcao_escala: string;
  confirmado: boolean;
  descricao?: string;
  pdf_url?: string;
  criado_em: string;
  atualizado_em?: string;
}

export default function EscalaDetalheScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [escala, setEscala] = useState<EscalaDetalhada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const { isDownloading, downloadProgress, error: downloadError, downloadDocument, clearError } = useDocumentDownload();

  useEffect(() => {
    const fetchEscala = async () => {
      if (!id) return;

      try {
        const { data: escalaData, error: fetchError } = await supabase
          .from('cultos_escalas')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          setError('Erro ao carregar escala');
          console.error('Erro ao buscar escala:', fetchError);
          return;
        }

        if (escalaData) {
          setEscala(escalaData);
        }
      } catch (err) {
        setError('Erro ao carregar escala');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEscala();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getStatusColor = (confirmado: boolean) => {
    return confirmado ? 'bg-success/10 border-success text-success' : 'bg-warning/10 border-warning text-warning';
  };

  const getStatusText = (confirmado: boolean) => {
    return confirmado ? '✓ Confirmado' : '⏳ Pendente';
  };

  const handleDownloadPDF = async () => {
    if (!escala?.pdf_url) return;
    await downloadDocument(escala.pdf_url, `Escala-${escala.data_culto}.pdf`);
  };

  const handleViewPDF = () => {
    if (escala?.pdf_url) {
      setViewerVisible(true);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error || !escala) {
    return (
      <ScreenContainer className="p-6 items-center justify-center">
        <Text className="text-lg font-bold text-error mb-4">
          {error || 'Escala não encontrada'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary rounded-lg px-6 py-3"
        >
          <Text className="text-surface font-bold">Voltar</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-primary px-6 py-4 flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-surface/20 rounded-full p-2"
          >
            <Text className="text-surface font-bold text-lg">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-surface flex-1">Detalhe da Escala</Text>
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

          {/* Main Info Card */}
          <View className="bg-surface rounded-lg p-6 border border-border gap-4">
            {/* Tipo de Culto */}
            <View className="gap-2">
              <Text className="text-xs text-muted font-medium uppercase">Tipo de Culto</Text>
              <Text className="text-2xl font-bold text-foreground">{escala.tipo_culto}</Text>
            </View>

            {/* Data */}
            <View className="gap-2">
              <Text className="text-xs text-muted font-medium uppercase">Data</Text>
              <Text className="text-lg font-semibold text-foreground">
                {formatDate(escala.data_culto)}
              </Text>
            </View>

            {/* Hora */}
            <View className="flex-row gap-4">
              <View className="flex-1 gap-2">
                <Text className="text-xs text-muted font-medium uppercase">Início</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {formatTime(escala.hora_inicio)}
                </Text>
              </View>
              {escala.hora_fim && (
                <View className="flex-1 gap-2">
                  <Text className="text-xs text-muted font-medium uppercase">Fim</Text>
                  <Text className="text-lg font-semibold text-foreground">
                    {formatTime(escala.hora_fim)}
                  </Text>
                </View>
              )}
            </View>

            {/* Status */}
            <View className={cn('rounded-lg p-3 border', getStatusColor(escala.confirmado))}>
              <Text className="font-semibold text-sm">{getStatusText(escala.confirmado)}</Text>
            </View>
          </View>

          {/* Location and Function */}
          <View className="gap-4">
            {/* Local */}
            <View className="bg-surface rounded-lg p-4 border border-border gap-2">
              <Text className="text-xs text-muted font-medium uppercase">📍 Local</Text>
              <Text className="text-base font-semibold text-foreground">{escala.local}</Text>
            </View>

            {/* Função */}
            <View className="bg-surface rounded-lg p-4 border border-border gap-2">
              <Text className="text-xs text-muted font-medium uppercase">👤 Sua Função</Text>
              <Text className="text-base font-semibold text-foreground">{escala.funcao_escala}</Text>
            </View>
          </View>

          {/* Descrição */}
          {escala.descricao && (
            <View className="bg-primary/10 rounded-lg p-4 border border-primary gap-2">
              <Text className="text-xs text-primary font-medium uppercase">Observações</Text>
              <Text className="text-sm text-primary leading-relaxed">{escala.descricao}</Text>
            </View>
          )}

          {/* PDF Section */}
          {escala.pdf_url && (
            <View className="gap-3">
              <Text className="text-sm font-bold text-foreground uppercase">Escala em PDF</Text>

              {/* View PDF Button */}
              <TouchableOpacity
                onPress={handleViewPDF}
                disabled={isDownloading}
                className="bg-secondary rounded-lg py-3 items-center justify-center flex-row gap-2"
              >
                <Text className="text-lg">👁</Text>
                <Text className="text-surface font-semibold">Visualizar PDF</Text>
              </TouchableOpacity>

              {/* Download PDF Button */}
              <TouchableOpacity
                onPress={handleDownloadPDF}
                disabled={isDownloading}
                className={cn(
                  'rounded-lg py-3 items-center justify-center flex-row gap-2',
                  isDownloading ? 'bg-success/50' : 'bg-success'
                )}
              >
                {isDownloading ? (
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
                    <Text className="text-surface font-semibold">Baixar PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Metadata */}
          <View className="bg-surface rounded-lg p-4 border border-border gap-3">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted font-medium">Criado em</Text>
              <Text className="text-xs font-semibold text-foreground">
                {new Date(escala.criado_em).toLocaleDateString('pt-BR')}
              </Text>
            </View>

            {escala.atualizado_em && (
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted font-medium">Atualizado em</Text>
                <Text className="text-xs font-semibold text-foreground">
                  {new Date(escala.atualizado_em).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <Text className="text-xs text-muted font-medium">ID</Text>
              <Text className="text-xs font-mono text-foreground">{escala.id}</Text>
            </View>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary rounded-lg p-4 items-center mb-6"
          >
            <Text className="text-surface font-bold">Voltar para Escalas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PDF Viewer Modal */}
      <Modal
        visible={viewerVisible}
        animationType="slide"
        onRequestClose={() => setViewerVisible(false)}
      >
        {escala.pdf_url && (
          <PDFViewer
            uri={escala.pdf_url}
            fileName={`Escala-${escala.data_culto}.pdf`}
            onClose={() => setViewerVisible(false)}
          />
        )}
      </Modal>
    </ScreenContainer>
  );
}
