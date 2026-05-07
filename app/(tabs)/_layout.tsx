import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View } from "react-native";
import * as Notifications from 'expo-notifications';

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

// --- CONFIGURAÇÃO GLOBAL ---
// Definir fora do componente garante que o handler seja registrado assim que o módulo carregar
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // Ajuste de padding para evitar que a TabBar fique colada na base
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          elevation: 0, // Remove sombra estranha no Android
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="escalas"
        options={{
          title: "Escalas",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="documentos"
        options={{
          title: "Documentos",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text" color={color} />,
        }}
      />
      <Tabs.Screen
        name="noticias"
        options={{
          title: "Notícias",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="newspaper" color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />


      {/* --- TELAS OCULTAS --- */}
      <Tabs.Screen name="perfil/editar" options={{ href: null }} />
      <Tabs.Screen name="escalas/[id]" options={{ href: null }} />
      <Tabs.Screen name="noticias/[id]" options={{ href: null }} />
    </Tabs>
  );
}
