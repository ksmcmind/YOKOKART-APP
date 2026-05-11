// App.jsx
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider } from 'react-redux'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { registerRootComponent } from 'expo'
import store from './src/store/index'
import RootNavigator from './src/navigation/RootNavigator'

import { useSelector } from 'react-redux'
import { selectUser } from './src/store/slices/authSlice'
import { useNotifications } from './src/hooks/useNotifications'

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <Provider store={store}>
                    <RootNavigator />
                </Provider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}

registerRootComponent(App)  // ← must be after App is defined