// src/utils/permissions.js
import * as Location from 'expo-location'
import * as Camera from 'expo-camera'
import * as Notifications from 'expo-notifications'
import * as ImagePicker from 'expo-image-picker'

export const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    return status === 'granted'
}

export const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
    return status === 'granted'
}

export const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    return status === 'granted'
}

export const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
}

export const getPushToken = async () => {
    try {
        const granted = await requestNotificationPermission()
        if (!granted) return null
        const token = (await Notifications.getExpoPushTokenAsync()).data
        return token
    } catch (e) {
        console.warn('Get push token error:', e)
        return null
    }
}

export const getCurrentLocation = async () => {
    const granted = await requestLocationPermission()
    if (!granted) return null
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
    return {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
    }
}

// Take photo with camera
export const takePhoto = async () => {
    const granted = await requestCameraPermission()
    if (!granted) return null
    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
    })
    if (result.canceled) return null
    const asset = result.assets[0]
    return {
        uri: asset.uri,
        base64: `data:image/jpeg;base64,${asset.base64}`,
    }
}

// Pick from gallery
export const pickImage = async () => {
    const granted = await requestMediaPermission()
    if (!granted) return null
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
    })
    if (result.canceled) return null
    const asset = result.assets[0]
    return {
        uri: asset.uri,
        base64: `data:image/jpeg;base64,${asset.base64}`,
    }
}