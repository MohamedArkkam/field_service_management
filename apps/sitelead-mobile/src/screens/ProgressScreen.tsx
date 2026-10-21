import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { api } from '../api/client'
import type { ProgressUpdate } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import type { RootStackParamList } from '../navigation/types'
import { ErrorBox } from '../ui/ErrorBox'
import { styles } from '../ui/styles'

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>

export function ProgressScreen({ route }: Props) {
  const { projectId } = route.params
  const { token } = useAuth()
  const [items, setItems] = useState<ProgressUpdate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    try {
      setItems(await api.listProgress(token, projectId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress')
    } finally {
      setLoading(false)
    }
  }, [token, projectId])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      void load()
    }, [load]),
  )

  async function createDraft() {
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
      setTitle('')
      setNote('')
      setPhotoUrl('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function publish(item: ProgressUpdate, rating: number) {
    if (!token) return
    setBusy(true)
    setError(null)
    try {
      await api.publishProgress(token, projectId, item.id, rating)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        ListHeaderComponent={
          <View style={{ gap: 8 }}>
            <Text style={styles.title}>Progress</Text>
            <Text style={styles.subtitle}>Drafts stay internal until you publish + rate</Text>
            <ErrorBox message={error} onRetry={() => void load()} />
            <View style={styles.card}>
              <Text style={styles.cardTitle}>New draft</Text>
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} />
              <Text style={styles.label}>Note</Text>
              <TextInput
                style={[styles.input, { minHeight: 64, textAlignVertical: 'top' }]}
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
              <Pressable style={styles.button} onPress={() => void createDraft()} disabled={busy}>
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save draft</Text>
                )}
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.muted}>No progress updates yet.</Text> : undefined
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={[styles.chip, item.status === 'PUBLISHED' ? styles.chipOk : styles.chipWarn]}>
              {item.status}
              {item.rating != null ? ` · ${item.rating}/5` : ''}
            </Text>
            {item.note ? <Text style={styles.muted}>{item.note}</Text> : null}
            {item.photoUrl ? <Text style={styles.muted}>Photo: {item.photoUrl}</Text> : null}
            {item.status === 'DRAFT' ? (
              <View style={styles.row}>
                {[1, 2, 3, 4, 5].map((r) => (
                  <Pressable
                    key={r}
                    style={styles.buttonSecondary}
                    onPress={() => void publish(item, r)}
                    disabled={busy}
                  >
                    <Text style={styles.buttonSecondaryText}>★{r}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  )
}
