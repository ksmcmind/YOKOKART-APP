import { createStackNavigator } from '@react-navigation/stack';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import MyBookingsScreen from '../screens/bookings/MyBookingsScreen';

const Stack = createStackNavigator();

export default function OrdersStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
        </Stack.Navigator>
    );
}
