import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PasswordInput } from './BoredSearch/inputs';
import { BoredButton } from './BoredSearch/buttons';
import NetInfo from "@react-native-community/netinfo";
import { useNavigation, router, useLocalSearchParams } from 'expo-router';
import { BoredSearchDataManagment, LightToast } from './BoredSearch/tools';
import { SettingsLogic } from './BoredSearch/logicBored';
import Ionicons from '@expo/vector-icons/Ionicons';

const dataManagment = new BoredSearchDataManagment()
const Toast = new LightToast()
const settingsLogic = new SettingsLogic()

export default Password = () => {
    const params = useLocalSearchParams();
    const [oldPassword, setOldpassword] = useState('');
    const [newPassword, setNewpassword] = useState('');
    const [verifyPassword, setVerifypassword] = useState('');
    const [loading, setLoading] = useState(false);
    const oldPasswordBorder = useRef(params.colorText);
    const passwordBorder = useRef(params.colorText);
    const errorMessages = useRef(' ');
    const passwordCurrently = useRef('');
    const navigation = useNavigation();

    useEffect(()=>{
        navigation.setOptions({
            title: 'Change Password',
            headerStyle: {
                backgroundColor: params.colorBackground
            },
            headerTitleStyle: {
                color: params.colorText
            },
            headerLeft: ()=>
                <View style={{width: 50, height: 30, justifyContent: 'center'}}>
                  <Ionicons name="arrow-back" size={25} color={params.colorText} onPress={()=>router.back()}/>
                </View>
        })
        async function setUpPasswordChange() {
            const userData = await dataManagment.pull('@user')
            const tempPasswordData = await dataManagment.pull('@tempPassword')
            passwordCurrently.current = userData.password
            if (tempPasswordData){
                setOldpassword(userData.password)
            }
        }
        setUpPasswordChange()
    }, []);


    async function updatePassword() {
        const themeColor = params.colorText
        passwordBorder.current = themeColor
        oldPasswordBorder.current = themeColor
        setLoading(true)
        if ((await NetInfo.fetch()).isConnected) {
            const passwordResult = await settingsLogic.passwordUpdate(passwordCurrently.current, oldPassword, newPassword, verifyPassword)
            if (passwordResult.status==0) {
                passwordBorder.current = 'red'
                errorMessages.current = passwordResult.message
            }
            else if (passwordResult.status==2) {
                oldPasswordBorder.current = 'red'
                errorMessages.current = passwordResult.message
            }
            else if (passwordResult.status==1) {
                await dataManagment.save('tempPassword', false)
                router.push('/(tabs)/')
                Toast.toast('Password Updated')
            }
            else {
                Toast.toast('Network Error')
            }
        }
        else {
            Toast.toast('No Connection')
        }
        setLoading(false)
    };

    return (
        <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center', backgroundColor: params.colorBackground}}>
            <PasswordInput 
                placeHolder={'Old Password'} 
                password={oldPassword} 
                passwordBorder={oldPasswordBorder.current} 
                message={errorMessages.current} 
                themeColor={params.colorText} 
                typePassword={text=>setOldpassword(text)}
            />
            <PasswordInput 
                placeHolder={'New Password'} 
                password={newPassword} 
                passwordBorder={passwordBorder.current} 
                message={errorMessages.current} 
                themeColor={params.colorText} 
                typePassword={text=>setNewpassword(text)}
            />
            <PasswordInput 
                placeHolder={'Verify Password'} 
                password={verifyPassword} 
                passwordBorder={passwordBorder.current} 
                message={errorMessages.current} 
                themeColor={params.colorText} 
                typePassword={text=>setVerifypassword(text)}
            />
            {loading ? <ActivityIndicator size='large'/> : 
                <>
                    <BoredButton fill text='Update' customizeTextColor='white' onPress={()=>updatePassword()} />
                    <BoredButton fill text='Cancel' customizeTextColor='white' onPress={()=>navigation.goBack()} />
                </>
            }
        </View>
    )
};