import { ScrollView, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function AssistenteScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o Assistente do Obreiro. Como posso ajudá-lo?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, a funcionalidade de IA ainda está em desenvolvimento. Por favor, tente novamente mais tarde.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  return (
    <ScreenContainer className="p-0 flex-1">
      <View className="flex-1 flex-col">
        {/* Header */}
        <View className="bg-primary px-6 py-6">
          <Text className="text-2xl font-bold text-surface">🤖 Assistente</Text>
          <Text className="text-sm text-surface/70 mt-1">
            Faça perguntas sobre escalas e documentos
          </Text>
        </View>

        {/* Messages */}
        <ScrollView
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ gap: 3 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              className={`flex-row ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <View
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-primary'
                    : 'bg-surface border border-border'
                }`}
              >
                <Text
                  className={`text-sm ${
                    message.sender === 'user'
                      ? 'text-surface'
                      : 'text-foreground'
                  }`}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-4 border-t border-border gap-2">
          <View className="flex-row gap-2 items-center">
            <TextInput
              className="flex-1 bg-surface rounded-lg px-4 py-3 border border-border text-foreground"
              placeholder="Digite sua pergunta..."
              placeholderTextColor={colors.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
              className={`rounded-lg p-3 ${
                inputText.trim() ? 'bg-primary' : 'bg-primary/50'
              }`}
            >
              <Text className="text-surface font-bold">Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
