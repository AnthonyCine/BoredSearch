import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { FavoriteFolder } from '../BoredSearch/layouts';
import { NewFolderInput } from '../BoredSearch/inputs';
import { ActionBoredAlert } from '../BoredSearch/popups';
import { LightToast, BoredSearchColors } from '../BoredSearch/tools';
import { BoredButton, FolderButton } from '../BoredSearch/buttons';
import { FavoriteLogic } from '../BoredSearch/logicBored';
import NetInfo from "@react-native-community/netinfo";
import { useNavigation, router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

const Toast = new LightToast();
const favoriteLogic = new FavoriteLogic();

const Grey = 'rgb(105,105,105)'

export default Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [newFolder, setNewfolder] = useState(false);
    const [folderError, setFoldererror] = useState(null);
    const [loading, setLoading] = useState(false);
    const folderActive = useRef(Grey)
    const navigation = useNavigation()
    const folderOpen = useRef(false)
    const focused = useIsFocused()

    function addFolder() {
        if (folderOpen.current==false) {
          folderOpen.current = true
          folderActive.current = BoredSearchColors.BoredThemeNoOpacity
          setNewfolder(true)
        }
        else {
          folderOpen.current = false
          folderActive.current = Grey
          setNewfolder(false)
        }
    };
    
    useEffect(()=>{
        navigation.setOptions({
            headerRight: () => (
                <FolderButton folderColor={folderActive.current} onPress={()=>addFolder()}/>
            ),
        })
    }, [newFolder]);

    useEffect(()=>{
        async function getFolders() {
            if (focused) {
                setLoading(true)
                if ((await NetInfo.fetch()).isConnected){
                    const folders = await favoriteLogic.folderCheck()
                    if (folders.status==200){
                        setFavorites(folders.data)
                    }
                    else if (folders.status==401){
                        setFavorites([{folderId: 'empty'}])
                    }
                    else{
                        Toast.toast('Network Error')
                        setFavorites([{folderId: 'empty'}])
                    }
                }
                else {
                    setFavorites([{folderId: 'empty'}])
                    Toast.toast('No Connection')
                }
                setLoading(false)
            }
        }
        getFolders()
    }, [focused]);
    
    async function addTheFolder(foldername) {
        setLoading(true)
        if ((await NetInfo.fetch()).isConnected) {
            const result = await favoriteLogic.addFolder(foldername)
            if (result.message){
                Toast.toast(result.message)
                setFoldererror(result.message)
            }
            else{
                setFavorites(result.folders)
            }
        }
        else{
            Toast.toast('No Connection')
        }
        addFolder()
        setLoading(false)
    };
    
    function deleteVerification(foldername, folderId) {
        const deleteAction = ()=>deleteFolder(folderId)
        ActionBoredAlert(`Delete folder ${foldername}?`, deleteAction)
    };
        
    async function deleteFolder(folder) {
        const folders = await favoriteLogic.removeFolder(folder)
        setFavorites(folders)
    };

    async function deleteEverything() {
        if ((await NetInfo.fetch()).isConnected){
            setFavorites(await favoriteLogic.removeAllFavsAndFolders())
            Toast.toast('Done')
        }
        else {
            Toast.toast('No Connection')
        }
    };
        
    return (
        <>
            <NewFolderInput 
                modalVisible={newFolder} 
                close={()=>addFolder()} 
                messageError={folderError} 
                newFolder={foldername=>addTheFolder(foldername)}
            />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <View style={{ width: '100%', alignItems: 'center', height: '100%' }}>
                    {loading ? 
                        <ActivityIndicator size='large' /> 
                        : 
                        <FlatList
                        data={favorites}
                        keyExtractor={(item) => item.folderId.toString()}
                        renderItem={({ item }) => {
                            if (item.folderId=='empty'){
                                return null
                            }
                            else {
                                return(
                                    <FavoriteFolder 
                                        folderId={item.folderId} 
                                        foldername={item.folder} 
                                        favoredAmount={item.favoritesCount} 
                                        navigation={router} 
                                        posIndex={item.posIndex} 
                                        deleteFolder={(foldername, folderId)=>deleteVerification(foldername, folderId)}
                                    />
                                )}
                            }}
                        />
                    }
                    <View style={{position: 'absolute', bottom: 0}}>
                        <BoredButton text='Delete All' textColor onPress={()=>deleteEverything()} />
                    </View>
                </View>
            </View>
        </>
    )
};