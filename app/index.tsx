import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Easing, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";

export default function SplashScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();

  // Valores da animação da Logo
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // --- NOVA ANIMAÇÃO PARA O TEXTO ---
  const textScaleAnim = useRef(new Animated.Value(0)).current; // Começa zerado

  useEffect(() => {
    if (loading) return;

    // Dispara as animações em paralelo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),

      // Animação do Texto: Ele cresce além do tamanho (1.3) e depois reduz para o tamanho normal (1.0)
      Animated.sequence([
        Animated.timing(textScaleAnim, {
          toValue: 1.3, // Aumenta bem
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(textScaleAnim, {
          toValue: 1.0, // Diminui para o tamanho final ideal
          friction: 4, // Deixa um efeito elástico no final
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        if (session) {
          router.replace("/(tabs)");
        } else {
          router.replace("/auth/login");
        }
      }, 500);
    });
  }, [session, loading]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/IEADALPE.png")}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ rotate: spin }, { scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />

      {/* Transformamos o Text comum em um Animated.Text para aceitar o estilo de escala */}
      <Animated.Text
        className="text-primary"
        style={[
          styles.text,
          {
            transform: [{ scale: textScaleAnim }],
            opacity: fadeAnim, // Faz o texto surgir no fade junto com o resto
          },
        ]}
      >
        IEADALPE
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20, // Espaço entre a logo e o texto
  },
  text: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});
