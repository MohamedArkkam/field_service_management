import { Pressable, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { styles } from '../ui/styles'

type Props = NativeStackScreenProps<RootStackParamList, 'ProjectHome'>

export function ProjectHomeScreen({ navigation, route }: Props) {
  const { projectId, projectName } = route.params

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>{projectName}</Text>
        <Text style={styles.subtitle}>Site Lead fast path — online required</Text>

        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Progress', { projectId, projectName })}
        >
          <Text style={styles.cardTitle}>Progress</Text>
          <Text style={styles.muted}>Draft updates → publish with rating 1–5</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Purchases', { projectId, projectName })}
        >
          <Text style={styles.cardTitle}>Purchases</Text>
          <Text style={styles.muted}>Log buys · Unpaid / Partial / Paid</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Workers', { projectId, projectName })}
        >
          <Text style={styles.cardTitle}>Workers & attendance</Text>
          <Text style={styles.muted}>Daily wage or monthly salary · mark present</Text>
        </Pressable>
      </View>
    </View>
  )
}
