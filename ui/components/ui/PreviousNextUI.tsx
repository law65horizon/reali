import { useTheme } from '@/theme/theme'
import React from 'react'
import { ActivityIndicator, TouchableOpacity, View, ViewProps } from 'react-native'
import { ThemedText } from '../ThemedText'
import { ThemedView } from '../ThemedView'

type UIProps = ViewProps & {
    nextFunc?: () => void
    prevFunc?: () => void
    nextLabel?: string
    prevLabel?: string
    disabled?: boolean
    nextLoading?: boolean
    prevLoading?: boolean
}
const PreviousNextUI = ({ style, nextFunc, prevFunc, nextLabel, prevLabel, disabled, prevLoading, nextLoading}: UIProps) => {
    const {theme} = useTheme()

  return (
    <ThemedView plain style={[{ backgroundColor: theme.colors.backgroundSec, paddingBottom: 12, paddingTop: 8}, style]}>
            <View style={{ justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop:0, flexDirection: 'row', gap: 5 }}>
              <TouchableOpacity
                disabled={!prevFunc }
                onPress={() => prevFunc!()}
                style={{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', opacity: !prevFunc ? 0.4 : 1 }}
              >
                {!prevLoading ? (
                  <ThemedText disabled type="defaultSemiBold" style={{ textDecorationLine: 'underline' }}>
                    {prevLabel || 'Previous'}
                  </ThemedText>
                ):
                  <ActivityIndicator size={'small'} animating={prevLoading} color={theme.colors.text} />
                }
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!nextFunc || disabled}
                onPress={() => nextFunc!()}
                style={{
                  backgroundColor: theme.colors.accent,
                  borderColor: theme.colors.border,
                  padding: 10,
                  paddingHorizontal: 20,
                  borderWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: !nextFunc || disabled ? 0.3 : 1,
                  borderRadius: 5,
                }}
              >
                {!nextLoading ? (
                  <ThemedText type="defaultSemiBold" style={{ color: theme.colors.background }}>
                    {nextLabel || 'Next'}
                  </ThemedText>
                ): (
                  <ActivityIndicator size={'small'} animating={prevLoading} color={theme.colors.background} />
                )}
              </TouchableOpacity>
            </View>
    </ThemedView>
  )
}

export default PreviousNextUI