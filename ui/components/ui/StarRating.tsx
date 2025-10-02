import { useTheme } from '@/theme/theme'; // Adjust to your theme import
import { MaterialIcons } from '@expo/vector-icons'; // Using MaterialIcons for stars
import { StyleSheet, View } from 'react-native';

interface StarRatingProps {
  rating: number; // Rating value (0–5)
  starSize?: number; // Optional size for stars
  starColor?: string; // Optional color for stars
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  starSize = 16,
  starColor // Default to gold if theme is unavailable
}) => {
  // Ensure rating is between 0 and 5
  const normalizedRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(normalizedRating); // Number of full stars
  const hasHalfStar = normalizedRating % 1 >= 0.5; // Half star if decimal >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Remaining empty stars

  const {theme} = useTheme()

  return (
    <View style={styles.container}>
      {/* Full stars */}
      {Array(fullStars)
        .fill(0)
        .map((_, index) => (
          <MaterialIcons
            key={`full-${index}`}
            name="star"
            size={starSize}
            color={starColor || theme.colors.text}
            accessibilityLabel="Full star"
          />
        ))}
      {/* Half star */}
      {hasHalfStar && (
        <MaterialIcons
          key="half"
          name="star-half"
          size={starSize}
          color={starColor || theme.colors.text}
          accessibilityLabel="Half star"
        />
      )}
      {/* Empty stars */}
      {Array(emptyStars)
        .fill(0)
        .map((_, index) => (
          <MaterialIcons
            key={`empty-${index}`}
            name="star-border"
            size={starSize}
            color={starColor || theme.colors.text}
            accessibilityLabel="Empty star"
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default StarRating;