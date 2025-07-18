import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { BoredSearchColors, BoredSearchDataManagment } from './tools';
import { BoredText } from './texts';
import { Sizehint } from './dimensions';
import {Icon} from './buttons'

const dataManagment = new BoredSearchDataManagment();
const sizeHint = new Sizehint();


const Dividers = () => {
    const { colors } = useTheme();

    return (
        <View style={{height:1, backgroundColor: colors.text}}></View>
    )
}



const TopicPill = props => {    
    const { colors } = useTheme();

    function handlePress() {
        if (props.onPress) {
            props.onPress()
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} style={[styleSheet.topicPillTouch, {borderColor: colors.text}]}>
            <View style={[styleSheet.alignCenter, { flexDirection: 'row', width:'100%' }]}>
                <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center', borderRadius: 40 }}>
                    <Icon name={props.addIt==true ? 'check' : 'plus'} color={BoredSearchColors.BoredThemeNoOpacity} size={20} />
                </View>
                <View style={{ width:'80%', borderRadius: 40 }}>
                    <Text style={{ alignSelf: 'center', color: colors.text }}>{props.topic}</Text>
                </View>
                <View style={{ width: '10%' }}></View>
            </View>
        </TouchableOpacity>
    )
};


const PasswordChange = props => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity 
            style={styleSheet.touchLayout} 
            onPress={()=>props.navigation.push({pathname: '../password', params: {colorText: colors.text, colorBackground: colors.background}})}
        >
            <BoredText text='Change Password' textStyle={{fontWeight:'500'}}/>
        </TouchableOpacity>
    )
};

const PersonalizedAds = props => {
    return (
        <TouchableOpacity style={styleSheet.touchLayout} onPress={()=>props.navigation.navigate('Personalized')}>
            <BoredText text='Personalized Ads' textStyle={{fontWeight:'500'}} />
        </TouchableOpacity>
    )
};


const AdsChoice = () => {
    const { colors } = useTheme();
    const [selected, setSelected] = useState('check');

    useEffect(()=>{
        async function adsChoice() {
            const choice = await dataManagment.pull('@personalAds')
            if (choice.personalized==true){ 
                setSelected('check')
            }
            else {
                setSelected('checkbox-blank-outline')
            }
        }
        adsChoice()
    }, [])

    async function changeSelection() {
        if (selected=='check'){
            setSelected('checkbox-blank-outline')
            await dataManagment.save('personalAds', {personalized: false})
        }
        else {
            setSelected('check')
            await dataManagment.save('personalAds', {personalized: true})
        }
    }

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: sizeHint.Y(.07) }} >
            <BoredText text='Personalized Ads' textStyle={{fontWeight:'500'}}/>
            <Icon name={selected} color={colors.text} size={25} onPress={()=>changeSelection()} />
        </View>
    )
};


const Privacy = props => {
    return (
        <TouchableOpacity 
            style={styleSheet.touchLayout} 
            onPress={()=>props.navigation.push({pathname: '../browser', params: {link: 'https://boredsearch.com/mobile/boredsearch/privacy_page/'}})}
        >
            <BoredText text='Privacy Policy' textStyle={{fontWeight:'500'}}/>
        </TouchableOpacity>
    )
};


const SearchSetting = props => {
    return (
        <TouchableOpacity 
            style={styleSheet.touchLayout} 
            onPress={()=>props.navigation.push({pathname: '../settings', params: {settings: props.profile, textColor: props.themeColor.text, backgroundColor: props.themeColor.background}})}
        >
            <BoredText text='Search Settings' textStyle={{fontWeight:'500'}}/>
        </TouchableOpacity>
    )
};


const Notification = () => {
    const { colors } = useTheme();

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <BoredText text='Notifications (Testing)' />
            <Icon name='check' color={colors.text} />
        </View>
    )
};

const SelectionText = props => {
    const { colors } = useTheme();

    function changeSelection() {
        if (props.selection==false) {
            props.onSelection(props.text)
        }
        else if (props.selection==true) {
            props.onUnselection(props.text)
        }
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '5%' }}>
            <BoredText text={props.text} />
            <Icon name={props.selection==false ? 'checkbox-blank-outline' : 'check'} color={colors.text} size={25} onPress={()=>changeSelection()}/>
        </View>
    )
};


const styleSheet = StyleSheet.create({
    topicPillTouch:{ 
        borderWidth: 1,  
        borderRadius: 40, 
        flexDirection:'row', 
        justifyContent: 'flex-start', 
        alignItems:'center', 
        height: 35, 
        flex: 1, 
        margin: 5 
    },
    alignCenter: {
        alignItems:'center', 
        justifyContent:'center'
    },
    touchLayout: {
        height: sizeHint.Y(.07), 
        justifyContent:'center'
    }
})


export { 
    AdsChoice,
    Dividers,
    Notification, 
    PasswordChange, 
    PersonalizedAds,
    SearchSetting,
    TopicPill, 
    Privacy,
}