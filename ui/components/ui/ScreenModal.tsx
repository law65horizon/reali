import React, { PropsWithChildren } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { ThemedView } from '../ThemedView';
 
type ScreenProps = PropsWithChildren<{
    isOpen: boolean;
    setIsOpen: (sios: boolean) => void
}>

const ScreenModal = ({
    children,
    isOpen,
    setIsOpen
}: ScreenProps) => {
  return (
    <View style={[styles.container]}>
      <Modal 
        animationType='fade'
        transparent={true}
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <ThemedView> {children} </ThemedView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding?
    }
})

export default ScreenModal