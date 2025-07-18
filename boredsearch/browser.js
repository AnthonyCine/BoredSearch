import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator } from 'react-native';
import { BoredText } from './BoredSearch/texts';
import { BoredSearchColors } from './BoredSearch/tools';
import NetInfo from "@react-native-community/netinfo";
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from 'expo-router';

//BoredSearch in app webView
export default Browser = () => {
    const { colors } = useTheme();
    const params = useLocalSearchParams();
    const link = params.link;
    const [connected, setConnected] = useState();
    const navigation = useNavigation()

    useEffect(()=>{
        navigation.setOptions({
            title: 'Bored Search',
            headerStyle: {
                backgroundColor: BoredSearchColors.BoredThemeNoOpacity
            },
        })
        async function browserConnection() {
            const conn = (await NetInfo.fetch()).isConnected
            if (conn) {
                setConnected(true)
            }
        }
        browserConnection()
    }, [])


    if (!connected) {
        return (
            <View style={{height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}}>
                <BoredText text='No Connection Available' />
            </View>
        )
    }
    else{
        return (
            <WebView 
                source={{ uri: link }}
                startInLoadingState={true}
                renderLoading={()=>{
                    return (
                        <View style={{ justifyContent:'center', alignItems: 'center', flex: 1, position: 'absolute', top: 0, width: '100%', height: '100%' }}>
                            <ActivityIndicator color={BoredSearchColors.BoredBlue} size={50} />
                        </View>
                    )
                }}
            />
        )
    }
};