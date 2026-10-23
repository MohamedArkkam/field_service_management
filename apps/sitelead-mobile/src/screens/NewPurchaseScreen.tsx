import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import type { RootStackParamList } from '../navigation/types'
import { ErrorBox } from '../ui/ErrorBox'
import { styles } from '../ui/styles'

type Props = NativeStackScreenProps<RootStackParamList, 'NewPurchase'>

export function NewPurchaseScreen({ route, navigation }: Props) {
  const { projectId } = route.params
  const { token } = useAuth()
  const [description, setDescription] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!token) return
    const value = Number(amount)
    if (!description.trim() || !(value > 0)) {
      setError('Description and amount (> 0) are required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.createPurchase(token, projectId, {
        description: description.trim(),
        vendorName: vendorName.trim() || undefined,
        amount: value,
      })
      navigation.goBack()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>New purchase</Text>
      <Text style={styles.subtitle}>Starts as Unpaid until you update amount paid</Text>
      <ErrorBox message={error} />

      <Text style={styles.label}>Description</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} autoFocus />

      <Text style={styles.label}>Vendor (optional)</Text>
      <TextInput style={styles.input} value={vendorName} onChangeText={setVendorName} />

      <Text style={styles.label}>Amount</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />

      <Pressable style={styles.button} onPress={() => void save()} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save purchase</Text>}
      </Pressable>
      <Pressable style={styles.buttonSecondary} onPress={() => navigation.goBack()} disabled={busy}>
        <Text style={styles.buttonSecondaryText}>Cancel</Text>
      </Pressable>
      <View style={{ height: 24 }} />
    </ScrollView>
  )
}
