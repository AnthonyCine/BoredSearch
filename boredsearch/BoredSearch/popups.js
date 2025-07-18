import React, { useEffect, useState } from 'react';
import { FlatList, Alert, Modal, View, Text, StyleSheet, ActivityIndicator, Image, Pressable } from 'react-native';
import { Sizehint } from './dimensions';
import { FavoriteInput } from './inputs';
import { BoredSearchColors } from './tools';
import { EventRegister } from 'react-native-event-listeners';
import { FavoriteLogic } from './logicBored';
import { BoredButton } from './buttons';
import { BoredText } from './texts';
import { useTheme } from '@react-navigation/native';

const sizeHint = new Sizehint();
const favoriteLogic = new FavoriteLogic()


const ActionBoredAlert = (alertMessage, action) => {
    Alert.alert(
        '',
        alertMessage,
        [
            {
                text: 'Cancel',
                style: 'cancel'
            },
            {
                text: 'Ok',
                onPress: action
            }
        ]
    )
};

const BoredAlert = (alertMessage) => {

    Alert.alert(
        '',
        alertMessage,
        [
            {
                text: 'Ok',
                style: 'cancel' 
            }
        ]
    )
};


const FavoritesDialog = props => {
    const { colors } = useTheme();
    const [currentFolders, setCurrentfolders] = useState([{folderId: 'empty', folder: ''}]);
    const [loading, setLoading] = useState(true);
    const hideDialog = () => props.addVisible(false);

    async function getFolders() {
        const listOfFolders = await favoriteLogic.folderCheck()
        setCurrentfolders(listOfFolders.data)
        setLoading(false)
    };

    useEffect(() => {
        function checkVisisbility() {
            if (props.visible) {
                getFolders()
            };
        }
        checkVisisbility()
    }, [props.visible])


    async function addFavorite(folder, contentId) {
        setLoading(true)
        await favoriteLogic.favorite('favorite', folder, contentId)
        hideDialog()
    };

    async function newFolder(folder, id) {
        setLoading(true)
        await favoriteLogic.favorite('newfolderfavorite', folder, id)
        hideDialog()
    };

    return (
        <Modal visible={props.visible} transparent={true}>
            <Pressable style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} onPress={()=>props.close()}>
                <View style={{width: sizeHint.X(.9), height: sizeHint.Y(.5), backgroundColor: colors.background, borderRadius: 20, borderWidth: 1, borderColor: 'grey'}}>
                    <View style={{ width: '100%', height: '46%', justifyContent: 'center', alignItems: 'center' }}>
                        <BoredText text='Add to Favorites'/>
                        <FavoriteInput onDone={(value)=>newFolder(value, props.id)} />
                    </View>
                    <View style={{ height: '55%', width:'100%'}}>
                        { loading ?
                            <View style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}> 
                                <ActivityIndicator size='small' color={BoredSearchColors.BoredThemeNoOpacity}/>
                            </View> :
                            <FlatList 
                                keyExtractor={item=>item.folder.toString()}
                                data={currentFolders}
                                style={{ height: sizeHint.Y(.1), width: '100%' }}
                                contentContainerStyle={{alignItems: 'center'}}
                                ItemSeparatorComponent={() => (
                                    <View style={{ height: 5 }} />
                                )}
                                renderItem={({ item }) => {
                                    if (item.folderId=='empty'){
                                        return null
                                    }
                                    else {
                                        return (
                                            <BoredButton text={item.folder} outline textColor onPress={()=>addFavorite(item.folder, props.id)} />
                                        )
                                    }
                                }}
                            />
                        }
                    </View>
                </View>
            </Pressable>
        </Modal>
    )
};


const IosToast = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [toastMessage, setToastmessage] = useState('');

    useEffect(()=>{
        let toastListener = EventRegister.addEventListener('toast', (message) => {
            timeIt(message)
        });
        return () => {
            EventRegister.removeEventListener(toastListener);
        }
    }, []);

    function timeIt(message){
        setToastmessage(message)
        setModalVisible(true)
        setTimeout(()=>{
        setModalVisible(false)
        }, 2000)
    };

    return (
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
            <View style={styles.toastView}>
                <View style={styles.innerToastView}>
                    <Text style={styles.modalText}>{toastMessage}</Text>
                </View>
            </View>
        </Modal>
    );
};




const SearchType = props => {
    const { colors } = useTheme();
    const hideDialog = () => props.searchTypeHide(false);

    async function searchType(SearchEngine) {
        props.onPress(SearchEngine)
        hideDialog()
    };

    return (
        <Modal visible={props.searchTypeShow} transparent={true}>
            <Pressable style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} onPress={()=>props.close()}>
                <View style={{backgroundColor: colors.background, borderRadius: 20, alignItems: 'center', width: sizeHint.X(.9), height: sizeHint.Y(.5), justifyContent: 'space-around', borderWidth: 1, borderColor: 'grey'}}>
                    <BoredButton text='Sites' height='13%' fill customizeTextColor='white' buttonStyle={styles.buttonStyle} containerStyle={styles.containerStyle} onPress={()=>searchType('web')} />
                    <BoredButton text='Images' height='13%' fill customizeTextColor='white' buttonStyle={styles.buttonStyle} containerStyle={styles.containerStyle} onPress={()=>searchType('image')} />
                    <BoredButton text='Videos' height='13%' fill customizeTextColor='white' buttonStyle={styles.buttonStyle} containerStyle={styles.containerStyle} onPress={()=>searchType('video')} />
                    <BoredButton text='Audios' height='13%' fill customizeTextColor='white' buttonStyle={styles.buttonStyle} containerStyle={styles.containerStyle} onPress={()=>searchType('audio')} />
                    <BoredButton text='Quotes' height='13%' fill customizeTextColor='white' buttonStyle={styles.buttonStyle} containerStyle={styles.containerStyle} onPress={()=>searchType('text')} />
                    <BoredButton text='All' height='13%' fill customizeTextColor='white' buttonStyle={styles.buttonStyle} containerStyle={styles.containerStyle} onPress={()=>searchType('all')} />
                </View>
            </Pressable>
        </Modal>
    )
};


//used to cover compoents when rotating from handset view to tablet view
const FlipSplash = ({visible}) => {
  
    return (
      <Modal animationType="fade" transparent={true} visible={visible}>
        <View style={{width:'100%', height:'100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black'}}>
            <Image source={require('./logo/boredsearchicon.png')} style={{width: 300, height: 300}} />
        </View>
      </Modal>
    )
}


const styles = StyleSheet.create({
    buttonStyle: {
        borderRadius: 10, 
        borderWidth:2, 
        borderColor: BoredSearchColors.BoredThemeNoOpacity
    },
    containerStyle: {
        padding: '3%',
        borderColor: BoredSearchColors.BoredThemeNoOpacity,
        borderRadius: 20
    },
    dialogOverlay: { 
        backgroundColor: 'black', 
        borderRadius: 20,
        height: 400,
        justifyContent: 'space-around',
        alignItems: 'center',
        width: 300,
        borderWidth: 1,
        borderColor:'grey'
    },
    toastView: {
        flex: 1, 
        justifyContent: "flex-end", 
        alignItems: "center"
    },
    innerToastView: {
        height: 50, 
        width: 150, 
        backgroundColor: "grey", 
        borderRadius: 200, 
        alignItems: "center", 
        justifyContent:'center', 
        shadowColor: "#000", 
        shadowOffset: {
            width: 0, 
            height: 2
        }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4, 
        elevation: 5, 
        marginBottom: 50
    },
    modalText: {
        textAlign: "center",
        height: 20
    }
  });

export { 
    ActionBoredAlert,
    BoredAlert,
    FavoritesDialog,
    SearchType,
    IosToast,
    FlipSplash
}