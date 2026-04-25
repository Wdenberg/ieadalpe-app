import { View, Text, TouchableOpacity, Image } from 'react-native';
import { cn } from '@/lib/utils';

interface NoticiaCardProps {
  titulo: string;
  autor_nome:string;
  resumo?: string;
  imagemUrl?: string;
  data: string;
  onPress?: () => void;
}

export function NoticiaCard({
  titulo,
  resumo,
  imagemUrl,
  data,
  onPress,
}: NoticiaCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-surface rounded-lg overflow-hidden mb-3 border border-border"
    >
      {imagemUrl && (
        <Image
          source={{ uri: imagemUrl }}
          style={{ width: '100%', height: 365 }}
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <Text className="text-xs text-muted font-medium mb-2">{formatDate(data)}</Text>
        <Text className="text-base font-bold text-foreground mb-2 leading-tight">
          {titulo}
        </Text>
        {resumo && (
          <Text className="text-sm text-muted leading-relaxed" numberOfLines={2}>
            {resumo}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
