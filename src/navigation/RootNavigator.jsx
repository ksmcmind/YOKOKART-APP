// src/navigation/RootNavigator.jsx
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { selectInitialized, selectUser } from '../store/slices/authSlice'
import SplashScreen from '../screens/auth/SplashScreen'
import AppNavigator from './AppNavigator'
import AuthNavigator from './AuthNavigator'
import { useNotifications } from '../hooks/useNotifications'

const Stack = createStackNavigator()

function NotificationHandler() {
    const user = useSelector(selectUser)
    const navigation = useNavigation()
    useNotifications(user?.id, navigation)
    return null
}

export default function RootNavigator() {
    const [splashDone, setSplashDone] = useState(false)
    const initialized = useSelector(selectInitialized)

    if (!splashDone) {
        return <SplashScreen onDone={() => setSplashDone(true)} />
    }

    return (
        <NavigationContainer>
            <NotificationHandler />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="App" component={AppNavigator} />
                <Stack.Screen name="AuthFlow" component={AuthNavigator} options={{ presentation: 'modal' }} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}