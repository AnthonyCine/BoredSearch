import React, { useState, useEffect } from "react";
import { TextInput, View, Platform, Dimensions, Modal, Pressable,StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Sizehint } from "./dimensions";
import { BoredText } from "./texts";
import { BoredButton, Icon } from "./buttons";
import { AdaptiveView } from "./layouts";
import { BoredSearchColors } from "./tools";

const sizeHint = new Sizehint()

const FavoriteInput = props => {
    const { colors } = useTheme();
    const [text, setText] = useState('');
    const [borderColor, setBordercolor] = useState(colors.text);

    function add() {
        if (text!=''){
            props.onDone(text)
            setText('')
        }
        else{
            setBordercolor('red')
        }
    };

    return (
        <AdaptiveView style={[styleSheet.centerAlign, {width: '100%'}]} viewHeight={.17}>
            <View style={{width: '95%', height: '45%'}}>
                <TextInput
                    placeholder='Folder Name'
                    placeholderTextColor={borderColor != 'red' ? colors.text : borderColor}
                    value={text}
                    maxLength={10}
                    onChangeText={text=>setText(text)}
                    style={{ width: '100%', color: colors.text, height: '100%', borderWidth: 1, borderBottomColor: borderColor}}
                />
            </View>
            <View style={[styleSheet.centerAlign, {width: '80%', height: '50%'}]}>
                <BoredButton text='Create' width='100%' height='80%' outline outlineColor={colors.text} textColor onPress={()=>add()} />
            </View>
        </AdaptiveView>
    )
};


const TopicInput = props => {
    const { colors } = useTheme();
    const [text, setText] = useState('');

    function handlePress() {
        if (props.onPress){
            props.onPress(text)
            setText('')
        }
    };

    return (
        <View style={styleSheet.topicInputView}>
            <TextInput
                placeholder='Search Topics'
                placeholderTextColor={colors.text}
                style={{ width: '80%', marginLeft: 15 }}
                value={text}
                onChangeText={text=>setText(text)}
            />
            <Icon name='plus' color={BoredSearchColors.BoredThemeNoOpacity} size={25} onPress={()=>handlePress()} style={{ paddingRight: '3%' }}/>
        </View>
    )
};


const NewFolderInput = ({modalVisible, close, messageError, newFolder}) => {
    const { colors } = useTheme();
    const [folderName, setFoldername] = useState('');
    const [placeholderMessage, setPlaceholderMessage] = useState('New Folder');
    const [placeHolderColor, setPlaceHolderColor] = useState(colors.text);

    useEffect(()=>{
        if (messageError){
            let newMessage = messageError
            if (props.messageError=='folders with this name already exists.'){
                newMessage = 'You already have a folder with that name.'
            }
            setPlaceholderMessage(newMessage)
            setPlaceHolderColor('red')
        }
    }, [messageError])

    function addNewFolder() {
        if (folderName!='') {
            newFolder(folderName)
            setFoldername('')
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
            <Pressable style={[styleSheet.centerAlign, {height: '100%', width: '100%'}]} onPress={()=>close()}>
                <View style={[styleSheet.newFolderInputView, {backgroundColor: colors.background}]}>
                    <View style={[styleSheet.centerAlign, {width: '100%', height: '30%'}]}>
                        <TextInput 
                            placeholder={placeholderMessage}
                            value={folderName}
                            placeholderTextColor={placeHolderColor=='red' ? placeHolderColor : colors.text}
                            onChangeText={text=>setFoldername(text)}
                            style={{ borderBottomWidth: 1, borderBottomColor: colors.text, width: '98%', color: colors.text }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center'}}>
                        <BoredButton text='Ok' customizeTextColor='white' fill onPress={()=>addNewFolder()} />
                        <BoredButton text='Cancel' customizeTextColor='white' fill onPress={()=>close()} />
                    </View>
                </View>
            </Pressable>
        </Modal>
    )
}


const PasswordInput = props => {
    const { colors } = useTheme();
    const [hidePassword, setHidepassword] = useState(true);
    const [width, setWidth] = useState(props.appWidth ? sizeHint.NewX(props.appWidth, .72) : sizeHint.X(.72))
    const message = props.message ? props.message : 'Enter Password';

    useEffect(()=>{
        const listen = Dimensions.addEventListener('change', status => {
            setWidth(sizeHint.NewX(status.window.width, .7))
        });
        return () => {
            listen.remove()
        } 
    }, [])

    const setPassword = (text) => {props.typePassword(text)};

    function passwordHide() {
        if (hidePassword==true) {
            setHidepassword(false)
        }
        else if (hidePassword==false){
            setHidepassword(true)
        }
    };

    return(
        <View>
            <View style={{ borderBottomWidth: 1, borderBottomColor: props.passwordBorder, flexDirection: 'row' }}>
                <TextInput 
                    placeholder={props.placeHolder ? props.placeHolder : 'Password'} 
                    placeholderTextColor={props.themeColor ? props.themeColor : colors.text}
                    value={props.password}
                    onChangeText={text=>setPassword(text)}
                    secureTextEntry={hidePassword}
                    style={{ width: width, color: props.themeColor ? props.themeColor : colors.text }}
                />
                <Icon 
                    name={hidePassword==true? 'eye-off-outline' : 'eye-outline'} 
                    color={props.themeColor ? props.themeColor : colors.text} 
                    size={30} 
                    onPress={()=>passwordHide()}
                />
            </View>
            {props.passwordBorder=='red' && message!='' ? <BoredText text={message} textStyle={{fontSize: 10, color: 'red'}} /> : null}
        </View>
    )
};


const EmailInput = props => {
    const { colors } = useTheme();
    const [width, setWidth] = useState(props.appWidth ? sizeHint.NewX(props.appWidth, .8) : sizeHint.X(.8))
    const setEmail = (text) => {props.typeEmail(text)};

    useEffect(()=>{
        const listen = Dimensions.addEventListener('change', status => {
            setWidth(sizeHint.NewX(status.window.width, .72))
        });
        return () => {
            listen.remove()
        }; 
    }, []);

    return(
        <View style={{ borderBottomColor: props.emailBorder, borderBottomWidth: 1 }}>
            <TextInput 
                placeholder = {props.placeHolder ? props.placeHolder : 'Email'} 
                placeholderTextColor={colors.text}
                keyboardType={Platform.OS=='android' ? 'visible-password': 'ascii-capable'}
                value={props.email}
                onChangeText={text => setEmail(text)}
                style={{color: colors.text, width: width}}
            />
            {props.emailBorder=='red' ? 
                <BoredText text={props.message ? props.message : 'Email already in use'} textStyle={{fontSize: 10, color: 'red'}} /> 
                : 
                null
            }
        </View>
    )
};


const styleSheet = StyleSheet.create({
    centerAlign: {
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    topicInputView: { 
        backgroundColor: 'rgba(143, 142, 142, 0.9)', 
        width: '100%', 
        borderWidth: 1, 
        borderColor: BoredSearchColors.BoredThemeNoOpacity, 
        borderRadius: 40, 
        height: 42, 
        flexDirection:'row', 
        justifyContent:'space-between', 
        alignItems: 'center' 
    },
    newFolderInputView: {
        borderWidth: 1, 
        borderColor: 'grey', 
        borderRadius: 15, 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        width: '90%', 
        height: sizeHint.Y(.2)
    }
})


export {
    FavoriteInput,
    TopicInput,
    NewFolderInput,
    PasswordInput,
    EmailInput,
}