import { Stack } from 'expo-router'
import React from 'react'

export default function WishlistLayout() {
  return (
    <Stack>
        <Stack.Screen name='index' options={{headerShown: false}}/>
        <Stack.Screen name='playlist' options={{headerShown: false}}/>
        <Stack.Screen name='tours' options={{headerShown: false}}/>
    </Stack>
  )
}
