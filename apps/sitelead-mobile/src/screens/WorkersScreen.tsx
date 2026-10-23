import { useCallback, useState } from 'react'
import {
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
import type { Attendance, Worker } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import type { RootStackParamList } from '../navigation/types'
import { ErrorBox } from '../ui/ErrorBox'
import { styles } from '../ui/styles'

type Props = NativeStackScreenProps<RootStackParamList, 'Workers'>

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function WorkersScreen({ route, navigation }: Props) {
  const { projectId, projectName } = route.params
  const { token } = useAuth()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [workDate, setWorkDate] = useState(todayIso())
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    try {
      const [w, a] = await Promise.all([
        api.listWorkers(token, projectId),
        api.listAttendance(token, projectId),
      ])
      setWorkers(w)
      setAttendance(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workers')
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

  async function markPresent(worker: Worker) {
    if (!token) return
    if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate)) {
      setError('Work date must be YYYY-MM-DD')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.markAttendance(token, projectId, worker.id, workDate)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Attendance failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={workers}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        ListHeaderComponent={
          <View style={{ gap: 8 }}>
            <Text style={styles.title}>Workers</Text>
            <Text style={styles.subtitle}>
              Daily = charge per attendance day · Monthly = one charge per calendar month
            </Text>
            <ErrorBox message={error} onRetry={() => void load()} />
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate('NewWorker', { projectId, projectName })}
            >
              <Text style={styles.buttonText}>Add worker</Text>
            </Pressable>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Attendance date</Text>
              <TextInput style={styles.input} value={workDate} onChangeText={setWorkDate} />
              <Text style={styles.muted}>YYYY-MM-DD · mark present on each worker below</Text>
            </View>
          </View>
        }
        ListEmptyComponent={!loading ? <Text style={styles.muted}>No workers yet.</Text> : undefined}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.fullName}</Text>
            <Text style={styles.chip}>
              {item.payType} · rate {item.rate}
            </Text>
            <Pressable style={styles.buttonSecondary} onPress={() => void markPresent(item)} disabled={busy}>
              <Text style={styles.buttonSecondaryText}>Mark present {workDate}</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={
          <View style={{ gap: 8, marginTop: 8 }}>
            <Text style={styles.cardTitle}>Recent attendance</Text>
            {attendance.length === 0 ? (
              <Text style={styles.muted}>None yet.</Text>
            ) : (
              attendance.slice(0, 20).map((a) => (
                <View key={a.id} style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {a.workerName} · {a.workDate}
                  </Text>
                </View>
              ))
            )}
          </View>
        }
      />
    </View>
  )
}
