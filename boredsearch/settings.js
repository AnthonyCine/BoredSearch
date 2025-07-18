import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { SelectionText } from './BoredSearch/texts';
import { BoredButton } from './BoredSearch/buttons';
import { BoredSearchDataManagment } from './BoredSearch/tools';
import { LightToast } from './BoredSearch/tools';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const dataManagment = new BoredSearchDataManagment()
const Toast = new LightToast()

export default Settings = () => {
    const props = useLocalSearchParams();
    const navigation = useNavigation();
    const [settings, setSettings] = useState([]);
    const refSettings = useRef([]);
    const profileData = useRef();
    const contentTypes = useRef([]);
    const Options = ['Images', 'Videos', 'Sites', 'Quotes', 'Safe Search'];

    useEffect(()=>{
        navigation.setOptions({
            title: 'Settings',
            headerStyle: {
                backgroundColor: props.backgroundColor
            },
            headerTitleStyle: {
                color: props.textColor
            },
            headerLeft: ()=>
                <View style={{width: 50, height: 30, justifyContent: 'center'}}>
                  <Ionicons name="arrow-back" size={25} color={props.textColor} onPress={()=>router.back()}/>
                </View>
        })
        
        async function pullSettings() {
            const setting = await dataManagment.pull('@user')
            profileData.current = setting
            refSettings.current = setting.settings
            for (let _content in setting.settings){
                if (setting.settings[_content]!='Safe Search'){
                    contentTypes.current.push(setting.settings[_content])
                }
            }
            setSettings(setting.settings)
        }
        pullSettings()
    }, []);

    function selectionMade(value) {
        if (value!='Safe Search') {
            contentTypes.current.push(value)
        }
        const newSettings = []
        refSettings.current.push(value)
        for (let _newChoices in refSettings.current) {
            newSettings.push(refSettings.current[_newChoices])
        }
        setSettings(newSettings)
    };

    function selectionRemove(value) {
        const newSettings = []
        if (value=='Safe Search'){
            for (let removeChoice in refSettings.current) {
                if (refSettings.current[removeChoice]==value) {
                    refSettings.current.splice(removeChoice, 1)
                }
            }
        }
        else {
            if (contentTypes.current.length==1){
                //pass
            }
            else {
                for (let removeChoice in refSettings.current) {
                    if (refSettings.current[removeChoice]==value) {
                        refSettings.current.splice(removeChoice, 1)
                        contentTypes.current.splice(removeChoice, 1)
                    }
                }
            }
        }
        for (let _newChoices in refSettings.current){
            newSettings.push(refSettings.current[_newChoices])
        }    
        setSettings(newSettings)
    };

    async function validateThis() {
        const newSaveData = {email: profileData.current.email, password: profileData.current.password, token: profileData.current.token, settings: settings}
        await dataManagment.save('user', newSaveData)
        Toast.toast('Settings Saved')
        navigation.goBack()
    };

    return(
        <View style={{flex: 1, backgroundColor: props.backgroundColor}}>
            <ScrollView>
                {Options.map((choice, key)=>{
                    return(
                        <SelectionText 
                            text={choice} 
                            key={key}
                            onSelection={()=>selectionMade(choice)} 
                            onUnselection={()=>selectionRemove(choice)} 
                            selection={settings.includes(choice) ? true : false}
                            theme={props.textColor}
                        />                        
                    )})
                }
            </ScrollView>
            <View style={{ position: 'absolute', bottom: 0, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <BoredButton text='Save' textColor fill color={props.backgroundColor} onPress={()=>validateThis()} />
            </View>
        </View>
    )
};