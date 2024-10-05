import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  color: string;
}

const NUM_PARTICLES = 30;
const COLORS = ["#FF5252", "#FFD740", "#64FFDA", "#448AFF", "#E040FB"];

const AuthorizedIndicator: React.FC = () => {
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const particles = useRef<Particle[]>([]).current;

  useEffect(() => {
    animateCheckmark();
    createParticles();
    animateParticles();
  }, []);

  const animateCheckmark = () => {
    Animated.spring(checkmarkScale, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const createParticles = () => {
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        scale: new Animated.Value(0),
        rotation: new Animated.Value(0),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  };

  const animateParticles = () => {
    const animations = particles.map((particle) => {
      const xDirection = Math.random() > 0.5 ? 1 : -1;
      const yDirection = Math.random() > 0.5 ? 1 : -1;
      return Animated.parallel([
        Animated.timing(particle.x, {
          toValue: xDirection * (50 + Math.random() * 100),
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(particle.y, {
          toValue: yDirection * (50 + Math.random() * 100),
          duration: 1000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: Math.random(),
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotation, {
          toValue: Math.random() * 360,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(50, animations).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.checkmarkContainer,
            { transform: [{ scale: checkmarkScale }] },
          ]}
        >
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </Animated.View>
        <Text style={styles.text}>Authorized</Text>
      </View>
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              backgroundColor: particle.color,
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  content: {
    alignItems: "center",
  },
  checkmarkContainer: {
    marginBottom: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default AuthorizedIndicator;
