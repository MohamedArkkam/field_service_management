import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
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

export function ProgressScreen({ route, navigation }: Props) {
  const { projectId, projectName } = route.params
  const { token } = useAuth()
  const [items, setItems] = useState<ProgressUpdate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
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

  function confirmDeleteDraft(item: ProgressUpdate) {
    Alert.alert(
      'Delete draft',
      `Delete “${item.title}”? Only your team can see drafts — this removes it permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete draft',
          style: 'destructive',
          onPress: () => void deleteDraft(item),
        },
      ],
    )
  }

  async function deleteDraft(item: ProgressUpdate) {
    if (!token) return
    setBusy(true)
    setError(null)
    try {
      await api.deleteDraftProgress(token, projectId, item.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
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
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate('NewProgress', { projectId, projectName })}
            >
              <Text style={styles.buttonText}>New draft</Text>
            </Pressable>
            {busy ? <ActivityIndicator color="#1f6b4a" /> : null}
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
              <View style={{ gap: 8 }}>
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
                <Pressable
                  style={styles.buttonDanger}
                  onPress={() => confirmDeleteDraft(item)}
                  disabled={busy}
                >
                  <Text style={styles.buttonDangerText}>Delete draft</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  )
}
