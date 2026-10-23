import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import type { RootStackParamList } from '../navigation/types'
import { ErrorBox } from '../ui/ErrorBox'
import { styles } from '../ui/styles'

type Props = NativeStackScreenProps<RootStackParamList, 'NewProgress'>

export function NewProgressScreen({ route, navigation }: Props) {
  const { projectId } = route.params
  const { token } = useAuth()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!token || !title.trim()) {
      setError('Title is required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.createProgress(token, projectId, {
        title: title.trim(),
        note: note.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
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
      <Text style={styles.title}>New draft</Text>
      <Text style={styles.subtitle}>Stays internal until you publish + rate from the list</Text>
      <ErrorBox message={error} />

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} autoFocus />

      <Text style={styles.label}>Note</Text>
      <TextInput
        style={[styles.input, { minHeight: 88, textAlignVertical: 'top' }]}
        multiline
        value={note}
        onChangeText={setNote}
      />

      <Text style={styles.label}>Photo URL (optional)</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={photoUrl}
        onChangeText={setPhotoUrl}
        placeholder="https://…"
      />

      <Pressable style={styles.button} onPress={() => void save()} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save draft</Text>}
      </Pressable>
      <Pressable style={styles.buttonSecondary} onPress={() => navigation.goBack()} disabled={busy}>
        <Text style={styles.buttonSecondaryText}>Cancel</Text>
      </Pressable>
      <View style={{ height: 24 }} />
    </ScrollView>
  )
}
