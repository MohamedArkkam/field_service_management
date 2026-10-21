import { Pressable, Text, View } from 'react-native'
import { styles } from './styles'

export function ErrorBox({
  message,
  onRetry,
}: {
  message: string | null
  onRetry?: () => void
}) {
  if (!message) return null
  return (
    <View style={styles.card}>
      <Text style={styles.error}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.buttonSecondary} onPress={onRetry}>
          <Text style={styles.buttonSecondaryText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  )
}
