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
import type { Purchase } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import type { RootStackParamList } from '../navigation/types'
import { ErrorBox } from '../ui/ErrorBox'
import { styles } from '../ui/styles'

type Props = NativeStackScreenProps<RootStackParamList, 'Purchases'>

export function PurchasesScreen({ route, navigation }: Props) {
  const { projectId, projectName } = route.params
  const { token } = useAuth()
  const [items, setItems] = useState<Purchase[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paidEdits, setPaidEdits] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    try {
      const list = await api.listPurchases(token, projectId)
      setItems(list)
      const edits: Record<string, string> = {}
      list.forEach((p) => {
        edits[p.id] = String(p.amountPaid)
      })
      setPaidEdits(edits)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load purchases')
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

  async function savePayment(item: Purchase) {
    if (!token) return
    const paid = Number(paidEdits[item.id] ?? '0')
    if (Number.isNaN(paid) || paid < 0 || paid > item.amount) {
      setError('amountPaid must be between 0 and amount')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.updatePurchasePayment(token, projectId, item.id, paid)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment update failed')
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
            <Text style={styles.title}>Purchases</Text>
            <Text style={styles.subtitle}>Status from amount paid: Unpaid / Partial / Paid</Text>
            <ErrorBox message={error} onRetry={() => void load()} />
            <Pressable
              style={styles.button}
              onPress={() => navigation.navigate('NewPurchase', { projectId, projectName })}
            >
              <Text style={styles.buttonText}>New purchase</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={!loading ? <Text style={styles.muted}>No purchases yet.</Text> : undefined}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.description}</Text>
            <Text style={styles.chip}>{item.paymentStatus}</Text>
            <Text style={styles.muted}>
              Amount {item.amount} · Paid {item.amountPaid} · Outstanding {item.outstanding}
            </Text>
            {item.vendorName ? <Text style={styles.muted}>Vendor: {item.vendorName}</Text> : null}
            <Text style={styles.label}>Update amount paid</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={paidEdits[item.id] ?? ''}
              onChangeText={(v) => setPaidEdits((prev) => ({ ...prev, [item.id]: v }))}
            />
            <Pressable style={styles.buttonSecondary} onPress={() => void savePayment(item)} disabled={busy}>
              <Text style={styles.buttonSecondaryText}>Save payment</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  )
}
