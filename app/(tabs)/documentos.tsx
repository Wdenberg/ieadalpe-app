import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Documento {
  id: string;
  nome: string;
  categoria: string;
  url: string;
  data_upload: string;
}

export default function DocumentosScreen() {
  const colors = useColors();
  const [documentos] = useState<Documento[]>([
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

  const handleDownload = async (documento: Documento) => {
    try {
      // Chamar Edge Function get-signed-url para obter URL temporária
      const { data, error } = await supabase.functions.invoke('get-signed-url', {
        body: { path: documento.url },
      });

      if (error) {
        console.error('Erro ao obter URL assinada:', error);
        return;
      }

      // Aqui você poderia abrir o PDF ou fazer download
      console.log('URL assinada:', data.signedUrl);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
    }
  };

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
        <View className="px-6 py-6 gap-4">
          {documentos.map((documento) => (
            <TouchableOpacity
              key={documento.id}
              onPress={() => handleDownload(documento)}
              className="bg-surface rounded-lg p-4 border border-border active:opacity-70"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-xs text-secondary font-semibold mb-1">
                    {documento.categoria}
                  </Text>
                  <Text className="text-base font-bold text-foreground">
                    {documento.nome}
                  </Text>
                  <Text className="text-xs text-muted mt-2">
                    Enviado em {new Date(documento.data_upload).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View className="bg-primary rounded-full p-2 ml-2">
                  <Text className="text-surface font-bold">↓</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View className="bg-warning/10 border border-warning rounded-lg p-4 mt-4">
            <Text className="text-xs text-warning font-semibold mb-1">⚠️ Aviso de Segurança</Text>
            <Text className="text-xs text-warning">
              Os documentos possuem acesso restrito com URLs temporárias (1 hora de validade).
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
