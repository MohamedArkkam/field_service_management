import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ActivityIndicator, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider, useAuth } from './src/auth/AuthContext'
import type { RootStackParamList } from './src/navigation/types'
import { LoginScreen } from './src/screens/LoginScreen'
import { NewProgressScreen } from './src/screens/NewProgressScreen'
import { NewPurchaseScreen } from './src/screens/NewPurchaseScreen'
import { NewWorkerScreen } from './src/screens/NewWorkerScreen'
import { ProgressScreen } from './src/screens/ProgressScreen'
import { ProjectHomeScreen } from './src/screens/ProjectHomeScreen'
import { ProjectsScreen } from './src/screens/ProjectsScreen'
import { PurchasesScreen } from './src/screens/PurchasesScreen'
import { WorkersScreen } from './src/screens/WorkersScreen'
import { colors } from './src/ui/theme'

const Stack = createNativeStackNavigator<RootStackParamList>()

function RootNavigator() {
  const { token, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.accent,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {!token ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Projects" component={ProjectsScreen} options={{ title: 'My sites' }} />
          <Stack.Screen
            name="ProjectHome"
            component={ProjectHomeScreen}
            options={({ route }) => ({ title: route.params.projectName })}
          />
          <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
          <Stack.Screen name="NewProgress" component={NewProgressScreen} options={{ title: 'New draft' }} />
          <Stack.Screen name="Purchases" component={PurchasesScreen} options={{ title: 'Purchases' }} />
          <Stack.Screen name="NewPurchase" component={NewPurchaseScreen} options={{ title: 'New purchase' }} />
          <Stack.Screen name="Workers" component={WorkersScreen} options={{ title: 'Workers' }} />
          <Stack.Screen name="NewWorker" component={NewWorkerScreen} options={{ title: 'Add worker' }} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}
