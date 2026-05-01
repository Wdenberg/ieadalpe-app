import { View, Text, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface EscalaCardProps {

  nome: string;
  data_inicio: string;
  data_fim: string;
  atual: boolean;
  onPress?: () => void;
}


export function EscalaCard({
  nome,
  data_fim,
  data_inicio,
  atual,
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
        atual ? 'border-tertiary' : 'border-border'
      )}
    >
      <View className="flex-row-reverse justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground mt-1">{atual}</Text>
        </View>
        {atual && (
          <View className="bg-tertiary rounded-full px-3 py-1">
            <Text className="text-xs font-semibold text-surface">Atual</Text>
          </View>
        )}
      </View>

      <View className="gap-2">
        <View className="flex-row items-start">
          <Text className="text-xs text-muted font-medium w-16">Nome:</Text>
          <Text className="text-sm text-foreground font-semibold flex-1" 
          numberOfLines={2} 
          ellipsizeMode="tail"
          >{nome}</Text>
        </View>
         <View className="flex-row items-center">
          <Text className="text-xs text-muted font-medium w-16">Inicio:</Text>
          <Text className="text-sm text-foreground font-semibold">{formatDate(data_inicio)}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-xs text-muted font-medium w-16">Fim:</Text>
          <Text className="text-sm text-foreground font-semibold">{formatDate(data_fim)}</Text>
        </View>
        
      </View>
    </TouchableOpacity>
  );
}
