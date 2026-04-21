import { View, Text, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface EscalaCardProps {
  data: string;
  hora: string;
  tipo: string;
  funcao: string;
  local: string;
  confirmado: boolean;
  onPress?: () => void;
}

export function EscalaCard({
  data,
  hora,
  tipo,
  funcao,
  local,
  confirmado,
  onPress,
}: EscalaCardProps) {
  const colors = useColors();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        'bg-surface rounded-lg p-4 mb-3 border',
        confirmado ? 'border-tertiary' : 'border-border'
      )}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-sm text-muted font-medium">{formatDate(data)}</Text>
          <Text className="text-lg font-bold text-foreground mt-1">{tipo}</Text>
        </View>
        {confirmado && (
          <View className="bg-tertiary rounded-full px-3 py-1">
            <Text className="text-xs font-semibold text-surface">Confirmado</Text>
          </View>
        )}
      </View>

      <View className="gap-2">
        <View className="flex-row items-center">
          <Text className="text-xs text-muted font-medium w-16">Horário:</Text>
          <Text className="text-sm text-foreground font-semibold">{hora}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-xs text-muted font-medium w-16">Função:</Text>
          <Text className="text-sm text-foreground font-semibold">{funcao}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-xs text-muted font-medium w-16">Local:</Text>
          <Text className="text-sm text-foreground font-semibold">{local}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
