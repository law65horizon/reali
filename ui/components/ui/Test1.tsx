// AppStoreScreen.tsx
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

type CardData = {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
};

const DATA: CardData[] = [
  {
    id: "1",
    title: "Today’s Picks",
    subtitle: "Handpicked for you",
    content: Array.from({ length: 20 }, (_, i) => `Content line ${i + 1}`),
  },
  {
    id: "2",
    title: "Top Games",
    subtitle: "What’s hot now",
    content: Array.from({ length: 20 }, (_, i) => `Game content ${i + 1}`),
  },
];

type CardProps = {
  item: CardData;
  isActive: boolean;
  openCard: (id: string) => void;
  closeCard: () => void;
  progress: Animated.SharedValue<number>;
};

const AnimatedCard: React.FC<CardProps> = ({ item, isActive, openCard, closeCard, progress }) => {
  const cardStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(progress.value, [0, 1], [width - 40, width], Extrapolate.CLAMP),
      height: interpolate(progress.value, [0, 1], [200, height], Extrapolate.CLAMP),
      borderRadius: interpolate(progress.value, [0, 1], [16, 0], Extrapolate.CLAMP),
      transform: [
        { translateY: interpolate(progress.value, [0, 1], [0, -50], Extrapolate.CLAMP) },
      ],
    };
  });

  return (
    <View style={styles.cardContainer}>
      <Pressable onPress={() => openCard(item.id)}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>

          {isActive && (
            <ScrollView
              style={{ marginTop: 20 }}
              onScroll={(e) => {
                if (e.nativeEvent.contentOffset.y <= -40) {
                  closeCard();
                }
              }}
              scrollEventThrottle={16}
            >
              {item.content.map((line, index) => (
                <Text key={index} style={styles.contentText}>
                  {line}
                </Text>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default function AppStoreScreen() {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const progress = useSharedValue(0); // animation state

  const openCard = (id: string) => {
    setActiveCard(id);
    progress.value = withSpring(1, { damping: 20, stiffness: 120 });
  };

  const closeCard = () => {
    progress.value = withSpring(0, { damping: 20, stiffness: 120 }, () => {
      runOnJS(setActiveCard)(null);
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={({ item }) => (
          <AnimatedCard
            item={item}
            isActive={activeCard === item.id}
            openCard={openCard}
            closeCard={closeCard}
            progress={progress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cardContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#f2f2f7",
    padding: 20,
    overflow: "hidden",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  contentText: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
});
