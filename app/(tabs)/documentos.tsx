import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useDocumentDownload } from '@/hooks/use-document-download';
import { PDFViewer } from '@/components/pdf-viewer';
import { cn } from '@/lib/utils';


interface Documento {
  id: string;
  titulo: string; 
  descricao:string;    // era nome
  tipo: string;       // era categoria
  arquivo_url: string; // era url
  created_at: string;
  visibilidade: string;
}

export default function DocumentosScreen({ userId }: { userId?: string }) {
  
 
  const colors = useColors();

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

 // 🔥 React Query - Versão corrigida para pegar o user logado
const {
  data: documentos = [],
  isLoading,
  error,
} = useQuery({
  queryKey: ['documentos', userId], 
  queryFn: async () => {
    // 1. Pega a sessão atual do Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    // Se não houver sessão, nem tenta buscar (evita erro de RLS)
    if (!session) return [];

    // 2. Busca os documentos
    const { data, error } = await supabase
      .from('documentos')
      .select('id, titulo, tipo, arquivo_url, created_at, descricao, visibilidade')
      .in('visibilidade', ['obreiros', 'publico'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },
  // Remova o "enabled: !!userId" e deixe carregar sempre, 
  // pois o ID será checado dentro da função acima.
  enabled: true, 
});

  // 🔥 Agrupar por categoria
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


  const normalizePath = (path: string) => {
  return path
    .replace('private://', '')
    .trim();
};

const getSignedUrl = async (path: string) => {
 
  const cleanPath = normalizePath(path);
  console.log("Tentando buscar o arquivo:", cleanPath); 
  console.log("PATH ORIGINAL:", path);
  console.log("PATH LIMPO:", cleanPath);// Log para debug

  const { data, error } = await supabase.storage
    .from('media-private')  // Nome do seu bucket
    .createSignedUrl(cleanPath, 60 * 60);

  if (error) {
    console.error('Erro ao gerar URL:', error);
    return null;
  }

  return data?.signedUrl;
};

  // 🔥 Abrir PDF
  const handleOpenDocument = async (documento: Documento) => {
    const signedUrl = await getSignedUrl(documento.arquivo_url);

    if (!signedUrl) return;

    setSelectedDocument({
      ...documento,
      arquivo_url: signedUrl,
    });

    setViewerVisible(true);
  };

  // 🔥 Download PDF
  const handleDownload = async (documento: Documento) => {
    try {
      setDownloadingId(documento.id);

      const signedUrl = await getSignedUrl(documento.arquivo_url);

      if (!signedUrl) return;

      // 🔥 No handleDownload, mude doc.tipo para doc.titulo
      await downloadDocument(signedUrl, `${documento.titulo}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCloseViewer = () => {
    setViewerVisible(false);
    setSelectedDocument(null);
  };

  // 🔥 Loading
  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  // 🔥 Erro
  if (error) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-error">Erro ao carregar documentos</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-primary px-6 py-6">
          <Text className="text-2xl font-bold text-surface">
            Documentos Restritos
          </Text>
          <Text className="text-sm text-surface/70 mt-1">
            Acesso exclusivo para obreiros
          </Text>
        </View>

        <View className="px-6 py-6 gap-6">
          {/* Erro download */}
          {downloadError && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <View className="flex-row justify-between">
                <Text className="text-error text-sm flex-1">
                  {downloadError}
                </Text>
                <TouchableOpacity onPress={clearError}>
                  <Text className="text-error font-bold">✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Vazio */}
          {categorizedDocumentos.length === 0 && (
            <Text className="text-center text-muted">
              Nenhum documento disponível
            </Text>
          )}

          {/* Lista */}
          {categorizedDocumentos.map((group) => (
            <View key={group.categoria} className="gap-3">
              <View className="flex-row items-center gap-2">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-xs font-bold text-primary px-2 uppercase">
                  {group.categoria}
                </Text>
                <View className="flex-1 h-px bg-border" />
              </View>

              {group.docs.map((doc) => (
                <View key={doc.id} className="gap-2">
                  {/* Card */}
                  <TouchableOpacity
                    onPress={() => handleOpenDocument(doc)}
                    disabled={isDownloading && downloadingId === doc.id}
                    className="bg-surface rounded-lg p-4 border border-border"
                  >
                    <Text className="text-xs text-warning font-semibold mb-1">
                      📄 {doc.tipo}
                    </Text>

                    <Text className="text-base font-bold text-foreground">
                      {doc.titulo}
                    </Text>

                    <Text className="text-xs text-muted mt-2">
                      {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                  </TouchableOpacity>

                  {/* Download */}
                  <TouchableOpacity
                    onPress={() => handleDownload(doc)}
                    disabled={isDownloading && downloadingId === doc.id}
                    className={cn(
                      'rounded-lg py-3 flex-row justify-center items-center gap-2',
                      isDownloading && downloadingId === doc.id
                        ? 'bg-success/50'
                        : 'bg-success'
                    )}
                  >
                    {isDownloading && downloadingId === doc.id ? (
                      <>
                        <ActivityIndicator color={colors.surface} />
                        <Text className="text-surface text-sm">
                          {downloadProgress
                            ? `${Math.round(downloadProgress.progress * 100)}%`
                            : 'Baixando...'}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text>⬇</Text>
                        <Text className="text-surface font-semibold">
                          Baixar Documento
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* PDF Viewer */}
      <Modal visible={viewerVisible} animationType="slide">
        {selectedDocument && (
          <PDFViewer
            uri={selectedDocument.arquivo_url}
            fileName={selectedDocument.titulo}
            onClose={handleCloseViewer}
          />
        )}
      </Modal>
    </ScreenContainer>
  );
}