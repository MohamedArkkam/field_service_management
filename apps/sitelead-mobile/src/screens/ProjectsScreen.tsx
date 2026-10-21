import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { api } from '../api/client'
import type { SiteProject } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import type { RootStackParamList } from '../navigation/types'
import { ErrorBox } from '../ui/ErrorBox'
import { styles } from '../ui/styles'

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>

export function ProjectsScreen({ navigation }: Props) {
  const { token, user, logout } = useAuth()
  const [projects, setProjects] = useState<SiteProject[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    try {
      setProjects(await api.listProjects(token))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [token])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      void load()
    }, [load]),
  )

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={projects}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        ListHeaderComponent={
          <View style={{ gap: 8, marginBottom: 8 }}>
            <Text style={styles.title}>My sites</Text>
            <Text style={styles.subtitle}>{user?.fullName ?? 'Site Lead'}</Text>
            <ErrorBox message={error} onRetry={() => void load()} />
            <Pressable style={styles.buttonDanger} onPress={() => void logout()}>
              <Text style={styles.buttonDangerText}>Sign out</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.muted}>No assigned projects yet. Ask Admin to assign you.</Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ProjectHome', { projectId: item.id, projectName: item.name })}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.muted}>
              {[item.clientDisplayName, item.location].filter(Boolean).join(' · ') || 'No location'}
            </Text>
          </Pressable>
        )}
      />
    </View>
  )
}
