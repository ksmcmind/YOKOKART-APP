// src/navigation/stacks.jsx
import { createStackNavigator } from '@react-navigation/stack'
import CartScreen from '../screens/cart/CartScreen'
import AddressScreen from '../screens/cart/AddressScreen'
import DeliverySlotScreen from '../screens/cart/DeliverySlotScreen'
import PaymentScreen from '../screens/cart/PaymentScreen'
import LiveTrackScreen from '../screens/tracking/LiveTrackScreen'
import DeliveredScreen from '../screens/tracking/DeliveredScreen'

const Stack = createStackNavigator()
export function CartStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Address" component={AddressScreen} />
            <Stack.Screen name="DeliverySlot" component={DeliverySlotScreen} />
            <Stack.Screen name="Payment" component={PaymentScreen} />
            <Stack.Screen name="LiveTrack" component={LiveTrackScreen} />
            <Stack.Screen name="Delivered" component={DeliveredScreen} />
        </Stack.Navigator>
    )
}
export default CartStack

// src/navigation/OrdersStack.jsx
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen'
import OrderDetailScreen from '../screens/orders/OrderDetailScreen'
import MyBookingsScreen from '../screens/bookings/MyBookingsScreen'

const Stack2 = createStackNavigator()
export function OrdersStack() {
    return (
        <Stack2.Navigator screenOptions={{ headerShown: false }}>
            <Stack2.Screen name="OrderHistory" component={OrderHistoryScreen} />
            <Stack2.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack2.Screen name="MyBookings" component={MyBookingsScreen} />
        </Stack2.Navigator>
    )
}

// src/navigation/ProfileStack.jsx
import ProfileScreen from '../screens/profile/ProfileScreen'
import EditProfileScreen from '../screens/profile/EditProfileScreen'
import AddressesScreen from '../screens/profile/AddressesScreen'
import KycStatusScreen from '../screens/profile/KycStatusScreen'
import SettingsScreen from '../screens/profile/SettingsScreen'

const Stack3 = createStackNavigator()
export function ProfileStack() {
    return (
        <Stack3.Navigator screenOptions={{ headerShown: false }}>
            <Stack3.Screen name="Profile" component={ProfileScreen} />
            <Stack3.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack3.Screen name="Addresses" component={AddressesScreen} />
            <Stack3.Screen name="KycStatus" component={KycStatusScreen} />
            <Stack3.Screen name="Settings" component={SettingsScreen} />
        </Stack3.Navigator>
    )
}