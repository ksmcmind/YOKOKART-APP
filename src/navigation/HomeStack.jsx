// src/navigation/HomeStack.jsx
import { createStackNavigator } from '@react-navigation/stack'
import HomeScreen from '../screens/home/HomeScreen'
import NotificationsScreen from '../screens/home/NotificationsScreen'
import CategoryScreen from '../screens/products/CategoryScreen'
import ProductListScreen from '../screens/products/ProductListScreen'
import ProductDetailScreen from '../screens/products/ProductDetailScreen'
import ProviderListScreen from '../screens/services/ProviderListScreen'
import ProviderDetailScreen from '../screens/services/ProviderDetailScreen'
import BookingConfirmScreen from '../screens/services/BookingConfirmScreen'
// Auth screens accessible from anywhere
import LoginScreen from '../screens/auth/LoginScreen'
import OtpScreen from '../screens/auth/OtpScreen'
import CityPickerScreen from '../screens/home/CityPickerScreen'

const Stack = createStackNavigator()

export default function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CityPicker" component={CityPickerScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Category" component={CategoryScreen} />
            <Stack.Screen name="ProductList" component={ProductListScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="ProviderList" component={ProviderListScreen} />
            <Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
            <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
            {/* Auth flow accessible from anywhere */}
            <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Otp" component={OtpScreen} options={{ presentation: 'modal' }} />
        </Stack.Navigator>
    )
}