import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { API_BASE_URL } from '../config'
import { useAuth } from '../auth/AuthContext'
import { ErrorBox } from '../ui/ErrorBox'
import { styles } from '../ui/styles'

export function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('lead@sitedirect.local')
  const [password, setPassword] = useState('Lead123!')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit() {
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { justifyContent: 'center', flex: 1 }]}>
        <Text style={styles.title}>SiteDirect</Text>
        <Text style={styles.subtitle}>Site Lead — online required</Text>
        <Text style={styles.muted}>API: {API_BASE_URL}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <ErrorBox message={error} onRetry={error ? () => void onSubmit() : undefined} />
          <Pressable style={styles.button} onPress={() => void onSubmit()} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
