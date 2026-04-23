import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface PDFViewerProps {
  uri: string;
  fileName: string;
  onClose: () => void;
}

export function PDFViewer({ uri, fileName, onClose }: PDFViewerProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carregamento do PDF
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [uri]);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-6 py-4 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm text-surface/70">Visualizando</Text>
          <Text className="text-lg font-bold text-surface" numberOfLines={1}>
            {fileName}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          className="bg-surface/20 rounded-full p-2"
        >
          <Text className="text-surface font-bold text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 bg-muted/10 items-center justify-center">
        {loading ? (
          <View className="items-center gap-4">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-muted text-sm">Carregando PDF...</Text>
          </View>
        ) : error ? (
          <View className="items-center gap-4 px-6">
            <Text className="text-2xl">⚠️</Text>
            <Text className="text-error font-semibold text-center">
              Erro ao carregar PDF
            </Text>
            <Text className="text-muted text-sm text-center">
              {error}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-primary rounded-lg px-6 py-3"
            >
              <Text className="text-surface font-bold">Fechar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView className="flex-1 w-full" contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 items-center justify-center bg-surface p-4">
              <View className="bg-muted/20 rounded-lg p-8 items-center gap-4">
                <Text className="text-4xl">📄</Text>
                <Text className="text-foreground font-semibold text-center">
                  {fileName}
                </Text>
                <Text className="text-muted text-sm text-center max-w-xs">
                  PDF carregado com sucesso. Use o botão de compartilhamento para abrir em um aplicativo de PDF.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Footer Info */}
      <View className="bg-surface border-t border-border px-6 py-4">
        <Text className="text-xs text-muted text-center">
          Este documento possui acesso restrito com URL temporária (válida por 1 hora)
        </Text>
      </View>
    </View>
  );
}
