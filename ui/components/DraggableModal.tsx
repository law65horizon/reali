import { useTheme } from '@/theme/theme';
import React, { useCallback } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_MODAL_HEIGHT = SCREEN_HEIGHT * 0.5;

interface DraggableModalProps {
  isVisible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  height?: number;
  backgroundColor?: string
}

const DraggableModal: React.FC<DraggableModalProps> = React.memo(
  ({ isVisible, onClose, children, height = DEFAULT_MODAL_HEIGHT, backgroundColor }) => {
    const translateY = useSharedValue(0);
    const isGestureActive = useSharedValue(false);
    const insets = useSafeAreaInsets();
    const {theme} = useTheme()

    // Handle modal close with synchronized animation
    const handleClose = useCallback(() => {
      translateY.value = withTiming(
        SCREEN_HEIGHT,
        { duration: 300 },
        (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        }
      );
    }, [onClose, translateY]);

    // Animated style for the modal content
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: isVisible
        ? withTiming(1, { duration: 300 })
        : withTiming(0, { duration: 300 }),
    }));

    // Pan gesture for dragging the modal
    const panGesture = Gesture.Pan()
      .onStart(() => {
        isGestureActive.value = true;
      })
      .onUpdate((event) => {
        const newTranslateY = event.translationY;
        if (newTranslateY >= 0) {
          translateY.value = newTranslateY;
        }
      })
      .onEnd(() => {
        isGestureActive.value = false;
        const dragThreshold = height * 0.3;
        if (translateY.value > dragThreshold) {
          // Close modal if dragged beyond threshold
          translateY.value = withTiming(
            SCREEN_HEIGHT,
            { duration: 300 },
            (finished) => {
              if (finished) {
                runOnJS(onClose)();
              }
            }
          );
        } else {
          // Snap back to original position
          translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
        }
      });

    // Reset position when modal is shown
    const resetPosition = useCallback(() => {
      translateY.value = withTiming(0, { duration: 300 });
    }, [translateY]);

    // Cleanup when modal is fully hidden
    const handleModalHide = useCallback(() => {
      translateY.value = 0;
    }, [translateY]);

    return (
      <Modal
        isVisible={isVisible}
        onModalShow={resetPosition}
        onModalHide={handleModalHide}
        onBackdropPress={handleClose}
        style={styles.modal}
        // Disable built-in animations
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={1}
        animationOutTiming={1}
        backdropTransitionOutTiming={0}
        useNativeDriverForBackdrop={true}
        useNativeDriver={true}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.modalContent,
              animatedStyle,
              { height, paddingBottom: insets.bottom, backgroundColor: backgroundColor || theme.colors.backgroundSec},
            ]}
          >
            <View style={styles.handle} accessibilityLabel="Drag to close" />
            {/* <View style={styles.content}>
              {children || (
                <Text style={styles.text}>Drag down to close this modal</Text>
              )}
            </View> */}
            {children || (
                <Text style={styles.text}>Drag down to close this modal</Text>
              )}
          </Animated.View>
        </GestureDetector>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    // backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    borderRadius: 2.5,
    marginVertical: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default DraggableModal;


// import React, { useCallback } from 'react';
// import { Dimensions, StyleSheet, Text, View } from 'react-native';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// import Modal from 'react-native-modal';
// import Animated, {
//   runOnJS,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
// } from 'react-native-reanimated';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// const MODAL_HEIGHT = SCREEN_HEIGHT * 0.5;
// const DRAG_THRESHOLD = MODAL_HEIGHT * 0.3;

// interface DraggableModalProps {
//   isVisible: boolean;
//   onClose: () => void;
//   children?: React.ReactNode;
// }

// const DraggableModal: React.FC<DraggableModalProps> = ({ isVisible, onClose, children }) => {
//   const translateY = useSharedValue(0);
//   const insets = useSafeAreaInsets();

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//   }));

//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       const newTranslateY = event.translationY;
//       if (newTranslateY >= 0) {
//         translateY.value = newTranslateY;
//       }
//     })
//     .onEnd(() => {
//       if (translateY.value > DRAG_THRESHOLD) {
//         translateY.value = withSpring(SCREEN_HEIGHT, { damping: 20 }, () => {
//           runOnJS(onClose)();
//         });
//       } else {
//         translateY.value = withSpring(0, { damping: 20 });
//       }
//     });

//   const resetPosition = useCallback(() => {
//     translateY.value = 0;
//   }, [translateY]);

//   return (
//     <Modal
//       isVisible={isVisible}
//       onModalShow={resetPosition}
//       onBackdropPress={onClose}
//     //   swipeDirection={} // Disable modal swipe to avoid conflicts
//       style={styles.modal}
//       animationIn="slideInUp"
//       animationOut="slideOutDown"
//       propagateSwipe={true}
//       useNativeDriver={true}
//     >
//       <GestureDetector gesture={panGesture}>
//         <Animated.View
//           style={[
//             styles.modalContent,
//             animatedStyle,
//             { paddingBottom: insets.bottom },
//           ]}
//         >
//           <View style={styles.handle} accessibilityLabel="Drag to close" />
//           <View style={styles.content}>
//             {children || (
//               <Text style={styles.text}>Drag down to close this modal</Text>
//             )}
//           </View>
//         </Animated.View>
//       </GestureDetector>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },
//   modalContent: {
//     height: MODAL_HEIGHT,
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   handle: {
//     width: 40,
//     height: 5,
//     backgroundColor: '#ccc',
//     alignSelf: 'center',
//     borderRadius: 2.5,
//     marginVertical: 10,
//   },
//   content: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     fontSize: 16,
//     color: '#333',
//   },
// });

// export default DraggableModal;