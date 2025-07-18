import React, { useState, useEffect, useRef } from 'react';
import { BoredText } from './texts';
import { useTheme } from '@react-navigation/native';
import { EventRegister } from 'react-native-event-listeners';
import { Sizehint, ScreenView } from './dimensions';
import { BoredSearchDataManagment, BoredSearchNetwork, LightToast, BoredSearchColors } from './tools';
import { View, TouchableOpacity, Alert, Share, Text, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const sizeHint = new Sizehint();
const screenView = new ScreenView();
const dataManagment = new BoredSearchDataManagment();
const network = new BoredSearchNetwork();
const Toast = new LightToast();

const DeleteIndicator = ({isLoading, loadingResult}) => {
    const error = {icon: 'check-circle-outline', color: loadingResult ? 'red' : 'grey'} 
    const good = {icon: 'check-circle-outline', color: 'green'}
    const colorCode = loadingResult==200 ? good : error

    return (
        <>
            {!isLoading ? 
                <>
                    <BoredText text='Delete Viewed Contents' textStyle={{fontWeight: 'bold', fontSize: 20}} />
                    <MaterialCommunityIcons name={colorCode.icon} size={30} color={colorCode.color} />
                </>
                :         
                <ActivityIndicator size='large' />
            }
        </>
    )
}

const DeleteViews = () => {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const result = useRef(null);
    
    async function deleteViews(){
        setLoading(true)
        const viewResults = await network.deleteViews()
        if (viewResults.status==200){
            result.current = 200
        }
        else{
            result.current = 0
        }
        setLoading(false)
    }

    return (
        <View style={[styleSheet.deleteViews, {borderBottomColor: colors.text}]}>
            <TouchableOpacity style={styleSheet.loadingIndicator} onPress={()=>deleteViews()}> 
                <DeleteIndicator isLoading={loading} loadingResult={result.current} />
            </TouchableOpacity>
            <BoredText 
                text='Contents that have apperared on your feed already will not appear again, delete views to have them appear on your feed again.' 
                textStyle={{fontWeight: 'bold'}} 
            />
        </View>
    )
};


const Icon = ({name, size, color, style, onPress}) => {

    if (!style) {
        style = {}
    }

    function handlePress() {
        if (onPress) {
            onPress()
        }
    }

    return (
        <MaterialCommunityIcons name={name} size={size} color={color} style={style} onPress={handlePress} />
    )
}


const BoredShuffle = () => {
    //Icon in tabbar for refreshing feed
    return (
        <View style={styleSheet.boredShuffleView}>
            <MaterialCommunityIcons name='autorenew' size={60} color='white'/>
        </View>
    )
};

//default button themed for app
const BoredButton = props => {
    const { colors } = useTheme();
    const [size, setSize] = useState({});
    const [buttonApperaence, setButtonapperaence] = useState({})

    function handlePress() {
        if (props.onPress) {
            props.onPress()
        }
    };

    useEffect(()=>{
        function setButtonSize() {
            const textColor = props.customizeTextColor ? props.customizeTextColor : props.textColor ? BoredSearchColors.BoredThemeNoOpacity : colors.text
            if (props.outline){
                const outlineColor = props.outlineColor ? props.outlineColor : colors.text 
                setButtonapperaence({
                    outline: outlineColor,
                    background: colors.background,
                    text: textColor
                })
            }
            else if (props.fill){
                const backgroundColor = props.color ? props.color : BoredSearchColors.BoredThemeNoOpacity 
                setButtonapperaence({
                    outline: backgroundColor,
                    background: backgroundColor,
                    text: textColor
                })
            }
            else if (props.tones){
                const backgroundColor = props.color ? props.color : colors.background 
                const outlineColor = props.outlineColor ? props.outlineColor : colors.text
                setButtonapperaence({
                    outline: outlineColor,
                    background: backgroundColor,
                    text: textColor
                })
            }
            else if (props.textColor){
                setButtonapperaence({
                    outline: colors.background,
                    background: colors.background,
                    text: textColor
                })
            }
            else {
                setButtonapperaence({
                    outline: colors.background,
                    background: colors.background,
                    text: textColor
                })
            }
            var buttonWidth = props.width ? props.width : Math.floor(sizeHint.X(.3))
            var buttonHeight = props.height ? props.height : Math.floor(sizeHint.Y(.06))
            const buttonActualSize = {w: sizeHint.X(.3), h: sizeHint.Y(.06)}
            if (typeof buttonWidth=='number') {
                if (Number.isInteger(buttonWidth)){
                    buttonActualSize.w = buttonWidth
                }
                else {
                    buttonActualSize.w = sizeHint.X(buttonWidth)
                }
            }
            else if (typeof buttonWidth=='string') {
                buttonActualSize.w = buttonWidth
            }

            if (typeof buttonHeight=='number') {
                if (Number.isInteger(buttonHeight)){
                    buttonActualSize.h = buttonHeight
                }
                else {
                    buttonActualSize.h = sizeHint.Y(buttonHeight)
                }
            }
            else if (typeof buttonHeight=='string') {
                buttonActualSize.h = buttonHeight
            }
            setSize(buttonActualSize)
        }
        setButtonSize()
    }, [colors]);

    useEffect(()=>{
        //listen for screen size change on foldables
        const listen = Dimensions.addEventListener('change', status => {
            var buttonWidth = props.width ? props.width : Math.floor(status.window.width*.3)
            var buttonHeight = props.height ? props.height : Math.floor(status.window.height*.06)
            const buttonActualSize = {w: status.window.width*.3, h: status.window.height*.06}
            if (typeof buttonWidth=='number') {
                if (Number.isInteger(buttonWidth)){
                    buttonActualSize.w = buttonWidth
                }
                else {
                    buttonActualSize.w = status.window.width*buttonWidth
                }
            }
            else if (typeof buttonWidth=='string') {
                buttonActualSize.w = buttonWidth
            }

            if (typeof buttonHeight=='number') {
                if (Number.isInteger(buttonHeight)){
                    buttonActualSize.h = buttonHeight
                }
                else {
                    buttonActualSize.h = status.window.height*buttonHeight
                }
            }
            else if (typeof buttonHeight=='string') {
                buttonActualSize.h = buttonHeight
            }
            setSize(buttonActualSize)
        })
        return () => {
            listen.remove()
        }
    }, []);

    return (
        <TouchableOpacity disabled={props.submit} style={{ borderWidth: 1, borderRadius: 10, borderColor: buttonApperaence.outline, backgroundColor: buttonApperaence.background, width: size.w, height: size.h, justifyContent:'center', alignItems: 'center' }} onPress={handlePress}>
            {props.submit ? <View>
                <ActivityIndicator size='small' color={BoredSearchColors.BoredThemeNoOpacity} />
            </View> :
            <Text style={{ color: buttonApperaence.text, fontWeight: 'bold', fontSize: 20 }}>{props.text}</Text>}
        </TouchableOpacity>
    )
};

const EmailVerificationButton = () => {
    const [verification, setVerification] = useState('Resend Verification');
    const [deactivate, setDeactivate] = useState(false)

    async function sendVerification() {
        if (verification=='Resend Verification') {
            setDeactivate(true)
            if ((await NetInfo.fetch()).isConnected){
                const emailRequest = await network.emailVerification()
                if (emailRequest.status==200) {
                    setVerification('Verification Sent')
                }
                else {
                    Toast.toast('Network Error')
                }
            }
            else{
                Toast.toast('No Connection')
            }
            setDeactivate(false)
        }
    };

    return (
        <View style={styleSheet.emailVerificationButtonView}>
            <View style={[styleSheet.emailVerificationButtonView, {height: sizeHint.Y(.2)}]}>  
                <View style={{width: '100%', alignItems: 'center'}}>
                    <BoredText text='Please Verify Email' />
                    <BoredText text="If you haven't received a verification yet click link below" textStyle={{textAlign: 'center'}} />  
                </View>
                <BoredButton 
                    text={verification} 
                    onPress={()=>sendVerification()} 
                    fill 
                    color='rgb(105,105,105)' 
                    width={sizeHint.X(.8)} 
                    submit={deactivate} 
                />
            </View>
            <View style={styleSheet.alignCenter}>
                <BoredText text="If account is already verified press the Re-Board button below." />
                <BoredText text="Arrow Down" textStyle={{textAlign: 'center'}} />
                <MaterialCommunityIcons name="arrow-down-bold-outline" size={30} />
            </View>
        </View>
    )
};


const FolderButton = props => {

    function handlePress() {
        if (props.onPress) {
            props.onPress()
        }
    };

    return (
        <View style={styleSheet.alignCenter}>
            <MaterialCommunityIcons 
                name={props.folderColor=='rgb(105,105,105)' ? 'folder-outline' : 'folder'} 
                color={props.folderColor} 
                size={30} 
                style={{padding: '1%'}} onPress={handlePress}
            />
        </View>
    )
};


//Main home button for refreshing or navigating to home screen
const HomeRefresh = props => {
    const [homeButton, setHomebutton] = useState('refresh');

    useEffect(()=>{
        if (props.focusedOn==true){
            setHomebutton('refresh')
        }
        else {
            setHomebutton('home-outline')
        }
    }, [props]);

    async function buttonPress() {
        EventRegister.emit('refresh')
    };

    return (
        <>
            {homeButton=='refresh' ? 
                <BoredShuffle onPress={()=>buttonPress()}/> 
                :
                <MaterialCommunityIcons name={homeButton} color={props.color} size={props.size}/>
            }
        </>
    )
};



const LogOutButton = () => {
    const {colors} = useTheme();

    async function LogOut() {
        await dataManagment.remove()
        EventRegister.emit('logout', screenView.getScreenDimension('width'))
    };

    function verifyLogOut() {
        Alert.alert(
            '',
            'Are you sure you want to log out?',
            [
                {
                    text: 'Yes',
                    onPress: ()=>LogOut()
                },
                {
                    text: 'Cancel',
                    type: 'cancel'
                }
            ]
        )
    };

    return (
        <TouchableOpacity style={[styleSheet.logOutButtonTouch, {borderBottomColor: colors.text}]} onPress={()=>verifyLogOut()}>
            <BoredText text='Log Out' textStyle={{color: BoredSearchColors.BoredThemeNoOpacity, fontWeight: 'bold', fontSize: 20}} />
        </TouchableOpacity>
    )
};


const DeleteAccount = () => {

    async function deleteAccount() {
        const token = await dataManagment.pull('@user')
        const res = await network.deleteAccount(token.token)
        if (res.status==200){
            await dataManagment.remove()
            EventRegister.emit('logout', screenView.getScreenDimension('width'))
        }
        else {
            Toast.toast('Network Error')
        }
    };

    function verifyDeletion() {
        Alert.alert(
            '',
            'Are you sure you want to delete your account?',
            [
                {
                    text: 'Yes',
                    onPress: ()=>deleteAccount()
                },
                {
                    text: 'Cancel',
                    type: 'cancel'
                }
            ]
        )
    };

    return (
        <TouchableOpacity style={styleSheet.deleteAccountTouch} onPress={()=>verifyDeletion()}>
            <BoredText text='Delete Account' textStyle={{color: 'red', fontWeight: 'bold', fontSize: 20}} />
        </TouchableOpacity>
    )
};


const SearchToggle = props => {
    const appWidth = props.appWidth ? props.appWidth : screenView.getScreenDimension('width')
    const { colors } = useTheme();
    const currentScreen = useRef(screenView.getScreenType());
    const [currentColor, setCurrentcolor] = useState();
    const buttonW = sizeHint.NewX(appWidth, .1) > 47 ? 47 : sizeHint.NewX(appWidth, .1)
    const [buttonSize, setbuttonSize] = useState({w: buttonW, touchW: sizeHint.X(.15)});

    useEffect(()=>{
        const listen = Dimensions.addEventListener('change', status => {
            if (screenView.columnReCheck(status.window.width)==1) {
                currentScreen.current = 'Handset'
                const newSize = {w: screenView.getResizedWidth(status.window.width, .1), touchW: screenView.getResizedWidth(status.window.width, .15)}
                setbuttonSize(newSize)
            }
            else {
                if (currentScreen.current == 'Tablet'){ 
                    //pass
                }
                else {
                    currentScreen.current = 'Tablet'
                    const newSize = {w: screenView.getResizedWidth(status.window.width, .1), touchW: screenView.getResizedWidth(status.window.width, .15)}
                    setbuttonSize(newSize)
                }
            }
        })
        return () => {
            listen.remove()
        }
    }, []);

    function changeColor() {
        if (currentColor==null) {
            setCurrentcolor(BoredSearchColors.BoredBlue)
        }
        else if (currentColor==BoredSearchColors.BoredBlue) {
            setCurrentcolor(null)
        }
    };

    function handlePress() {
        if (props.onPress) {
            changeColor()
            props.onPress()
        }
    };

    return (
        <TouchableOpacity style={[styleSheet.searchToggleTouch, {width: buttonSize.touchW}]} onPress={handlePress}>
            <View style={[styleSheet.searchToggleView, {borderColor: colors.text, backgroundColor: currentColor, height: buttonSize.w, width: buttonSize.w}]}>
                <MaterialCommunityIcons name='magnify' color={colors.text} size={25} />
            </View>
        </TouchableOpacity>
    )
};


//currently not setup to actually share anything
const ShareButton = props => {
    const { colors } = useTheme();

    async function shareThis() {
        try {
            const result = await Share.share({
                message:
                props.message,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } 
            else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } 
        catch (error) {
            BoringAlert(error.message);
        }
    };

    return (
        <View>
            <MaterialCommunityIcons name='share-variant-outline' color={colors.text} size={25} onPress={()=>shareThis()}/>
        </View>
    );
};


const WebViewButton = () => {
    const [webOptions, setWeboptions] = useState('In App');
    
    useEffect(()=>{
        async function setUpOptions() {
            const data = await dataManagment.pull('@weboptions')
            if (data) {
                setWeboptions(data.setting)
            }
        }
        setUpOptions()
    }, []);

    async function toggleWebView() {
        if (webOptions=='In App') {
            //allows for links to open in devices default browser
            await dataManagment.save('weboptions', {setting: 'Browser'})
            setWeboptions('Browser')
        }
        else {
            await dataManagment.save('weboptions', {setting: 'In App'})
            setWeboptions('In App')
        }
    };

    return (
        <TouchableOpacity style={styleSheet.webViewButtonView} onPress={()=>toggleWebView()}>
            <BoredText text='Open Links' textStyle={{fontWeight:'500'}}/>
            <BoredText text={webOptions} textStyle={{fontWeight:'500'}}/>
        </TouchableOpacity>
    )
};

const DarkLight = ({mode, onPress}) => {
    const { colors } = useTheme();
    
    function handlePress(){
        if (onPress){
            onPress()
        }
    }

    return(
        <TouchableOpacity style={styleSheet.darkLightStyle} onPress={handlePress}>
            {mode=='light' ? 
                <FontAwesome name="sun-o" size={30} color={colors.text} /> 
                :
                <FontAwesome name="moon-o" size={30} color={colors.text} />
            }
        </TouchableOpacity>
    )
}


const styleSheet = StyleSheet.create({
    alignCenter: { 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    deleteViews: {
        alignItems: 'center', 
        justifyContent: 'center', 
        borderBottomWidth: 1, 
        height: sizeHint.Y(.2)
    },
    loadingIndicator: {
        height: sizeHint.Y(.09), 
        width: sizeHint.X(1) , 
        justifyContent: 'space-between', 
        flexDirection: 'row', 
        alignItems: 'center'
    },
    boredShuffleView: { 
        backgroundColor: BoredSearchColors.BoredThemeNoOpacity, 
        borderColor: 'rgba(201, 198, 200, 0.41)', 
        borderWidth: 2, 
        borderRadius: 400, 
        width: 65, 
        height: 65, 
        justifyContent:'center', 
        alignItems: 'center', 
        marginBottom: sizeHint.Y(.03) 
    },
    emailVerificationButtonView: {
        height: sizeHint.Y(.9), 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        width: '100%'
    },
    logOutButtonTouch: {
        height: sizeHint.Y(.11), 
        justifyContent:'center', 
        borderBottomWidth:1
    },
    deleteAccountTouch: {
        height: sizeHint.Y(.07), 
        justifyContent:'center', 
        alignItems: 'center', 
        width: '100%'
    },
    searchToggleTouch: {
        height: '100%', 
        alignItems: 'center', 
        justifyContent:'center'
    },
    searchToggleView:
    { 
        padding: '1%', 
        borderWidth: 1, 
        borderRadius: 100,  
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    webViewButtonView: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        height: sizeHint.Y(.07) 
    },
    darkLightStyle: {
        width: sizeHint.X(.1), 
        height: sizeHint.X(.1), 
        justifyContent: 'center', 
        alignItems: 'center'
    }
})


export { 
    BoredButton,
    EmailVerificationButton,
    HomeRefresh,
    LogOutButton,
    DeleteAccount,
    SearchToggle,
    ShareButton,
    WebViewButton, 
    FolderButton, 
    BoredShuffle,
    Icon,
    DeleteViews,
    DarkLight
}
