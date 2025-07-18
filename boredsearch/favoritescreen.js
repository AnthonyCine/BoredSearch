import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import {  FavoriteCard } from './BoredSearch/layouts';
import { ActionBoredAlert } from './BoredSearch/popups';
import { FavoriteLogic } from './BoredSearch/logicBored';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const favoriteLogic = new FavoriteLogic();


export default FavoritesScreen = () => {
    const [favs, setFavs] = useState([{id:'empty'}]);
    const props = useLocalSearchParams()
    const navigation = useNavigation() 

    useEffect(() => {
        navigation.setOptions({
            title: props.title, 
            headerStyle: {
                backgroundColor: props.colorBackground,
            },
            headerTitleStyle: {
                color: props.colorText
            },
            headerLeft: ()=>
                <View style={{width: 50, height: 30, justifyContent: 'center'}}>
                  <Ionicons name="arrow-back" size={25} color={props.colorText} onPress={()=>router.back()}/>
                </View>
        })
        async function setupFavs() {
            const favData = await favoriteLogic.specificFavorites(props.folderId)
            setFavs(favData)
        }
        setupFavs()
    }, []);

    async function deleteFav(id, folder) {
        setFavs(await favoriteLogic.removeFavorite(id, folder))
    };

    const askDelete = (id, folder) => {
        const deleteAction = ()=>deleteFav(id, folder)
        ActionBoredAlert('Delete Favorite?', deleteAction)
    };

    return (
        <View style={{backgroundColor: props.colorBackground, flex: 1}}>
            <FlatList
                keyExtractor={(item)=>item.id.toString()}
                data={favs}
                ItemSeparatorComponent={() => (
                    <View style={{ height: 10 }} />
                )}
                renderItem={({ item }) => {
                    if (item.id=='empty') {
                        return null
                    }
                    else {
                        return (
                            <FavoriteCard 
                                title={item.title} 
                                id={item.id} 
                                link={item.link} 
                                navigation={router} 
                                onLongPress={()=>askDelete(item.id, props.folderId)}
                            />
                        )
                    }
                }}
            />
        </View>
    )
};