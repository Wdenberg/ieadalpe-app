import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, StyleSheet, TouchableOpacity } from "react-native";
import * as Notifications from "expo-notifications";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { TabBg } from "@/components/tab-bg"; // Importe o componente que criamos acima

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

  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  // Altura ligeiramente maior para acomodar a curva
  const tabBarHeight = 50 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1e88e55",
        tabBarInactiveTintColor: "#8e8e93",
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === "android" ? 6 : 0,
        },
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,
          backgroundColor: "transparent",
          elevation: 0,
          height: tabBarHeight,
          overflow: "visible",
        },

        tabBarBackground: () => (
          <TabBg color={colors.background} height={tabBarHeight} />
        ),
      }}
    >
      <Tabs.Screen
        name="documentos"
        options={{
          title: "Documentos",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="doc.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="noticias"
        options={{
          title: "Notícias",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="newspaper.circle.fill" color={color} />
          ),
        }}
      />

      {/* --- ABA CENTRAL (HOME / BOTÃO FLUTUANTE) --- */}
      <Tabs.Screen
        name="index"
        options={{
          title: "", // Remove o texto para ficar igual à imagem
          tabBarIcon: () => (
            // 1. Este container vira o Losango Azul
            <View style={styles.actionButton}>
              {/* 2. Este container interno desfaz a rotação para o ícone ficar reto */}
              <View style={{ transform: [{ rotate: "-45deg" }] }}>
                <IconSymbol
                  size={28}
                  name="house.circle.fill"
                  color="#FFFFFF"
                />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="escalas"
        options={{
          title: "Escalas",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="calendar.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.fill.checkmark" color={color} />
          ),
        }}
      />

      {/* --- TELAS OCULTAS --- */}
      <Tabs.Screen name="perfil/editar" options={{ href: null }} />
      <Tabs.Screen name="escalas/[id]" options={{ href: null }} />
      <Tabs.Screen name="noticias/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    width: 60,
    height: 60,
    backgroundColor: "#1e88e5", // Cor azul idêntica à imagem
    borderRadius: 22, // Raio menor + rotação cria o efeito "squircle" / losango arredondado
    transform: [{ rotate: "45deg" }], // Rotaciona o quadrado para virar um losango
    justifyContent: "center",
    alignItems: "center",
    top: -30, // Joga o botão para cima, saindo da barra
    // Sombra suave
    shadowColor: "#1e88e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
