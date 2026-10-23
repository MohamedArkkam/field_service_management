import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { api } from '../api/client'
import type { PayType } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import type { RootStackParamList } from '../navigation/types'
import { ErrorBox } from '../ui/ErrorBox'
import { styles } from '../ui/styles'

type Props = NativeStackScreenProps<RootStackParamList, 'NewWorker'>

export function NewWorkerScreen({ route, navigation }: Props) {
  const { projectId } = route.params
  const { token } = useAuth()
  const [fullName, setFullName] = useState('')
  const [payType, setPayType] = useState<PayType>('DAILY')
  const [rate, setRate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!token) return
    const value = Number(rate)
    if (!fullName.trim() || !(value > 0)) {
      setError('Name and rate (> 0) are required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.createWorker(token, projectId, {
        fullName: fullName.trim(),
        payType,
        rate: value,
      })
      navigation.goBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create worker failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Add worker</Text>
      <Text style={styles.subtitle}>
        Daily = charge per attendance day · Monthly = one charge per calendar month
      </Text>
      <ErrorBox message={error} />

      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} autoFocus />

      <Text style={styles.label}>Pay type</Text>
      <View style={styles.row}>
        {(['DAILY', 'MONTHLY'] as PayType[]).map((t) => (
          <Pressable
            key={t}
            style={payType === t ? styles.button : styles.buttonSecondary}
            onPress={() => setPayType(t)}
          >
            <Text style={payType === t ? styles.buttonText : styles.buttonSecondaryText}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Rate</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={rate} onChangeText={setRate} />

      <Pressable style={styles.button} onPress={() => void save()} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save worker</Text>}
      </Pressable>
      <Pressable style={styles.buttonSecondary} onPress={() => navigation.goBack()} disabled={busy}>
        <Text style={styles.buttonSecondaryText}>Cancel</Text>
      </Pressable>
      <View style={{ height: 24 }} />
    </ScrollView>
  )
}
