import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from "@/lib/auth-context";


export default function SplashScreen() {
  const router = useRouter();
  const { session, loading } = useAuth();
  // Valores da animação
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Começa um pouco menor

  useEffect(() => {
    if (loading) return;
    // Dispara as animações
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.back(1.5)), // Efeito de giro com "estilingue"
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start(() => {

      setTimeout(() => {
        if (session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/login');
        }
      }, 500);
    });
  }, [session, loading]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/IEADALPE.png')} // Verifique se o caminho está correto!
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [
              { rotate: spin },
              { scale: scaleAnim }
            ],
          },
        ]}
        resizeMode="contain"
      />
      <Text className='text-primary'
      >IEADALPE</Text>
    </View>


  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Se o fundo da imagem for branco, use branco aqui
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
});