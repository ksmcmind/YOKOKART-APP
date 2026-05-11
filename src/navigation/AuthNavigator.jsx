// src/navigation/AuthNavigator.jsx
import { createStackNavigator } from '@react-navigation/stack'
import LoginScreen from '../screens/auth/LoginScreen'
import OtpScreen from '../screens/auth/OtpScreen'

const Stack = createStackNavigator()

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
    )
}