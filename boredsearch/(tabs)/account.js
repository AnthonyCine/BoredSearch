import React, { useState, useEffect } from 'react';
import { View, ScrollView, FlatList } from 'react-native';
import { SearchSetting, PasswordChange, Privacy, PersonalizedAds, Dividers, TopicPill } from '../BoredSearch/labels';
import { useNavigation, router } from 'expo-router';
import { BoredSearchDataManagment } from '../BoredSearch/tools';
import { Sizehint } from '../BoredSearch/dimensions';
import {BoredText} from '../BoredSearch/texts';
import {WebViewButton, DeleteViews, DeleteAccount, LogOutButton} from '../BoredSearch/buttons'
import { TopicInput } from '../BoredSearch/inputs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from '@react-navigation/native';
import { IntrestLogic } from '../BoredSearch/logicBored';


const dataManagment = new BoredSearchDataManagment();
const sizeHint = new Sizehint();
const intrestLogic = new IntrestLogic();

const Intrests = () => {
    const [myIntrests, setMyintrests] = useState([]);

    async function addInterests(newInterests) {
        if (myIntrests.includes(newInterests.toLowerCase().trim()) || newInterests.trim()==''){
            //pass
        }
        else {
            const result = await intrestLogic.addIntrests(newInterests.toLowerCase(), myIntrests)
            if (result.message) {
                BoredAlert(result.message)        
            }
            else {
                setMyintrests(result)
            }
        }
    };

    async function removeInterests(topicName) {
        const result = await intrestLogic.removeIntrests(topicName, myIntrests)
        if (result) {
            setMyintrests(result)
        }
    };

    useEffect(()=>{
        async function getInterests() {
            const interestsValue = await dataManagment.savePullInterests('pull')
            if (interestsValue) {
                if (interestsValue == ''){
                    setMyintrests([])
                }
                else {
                    setMyintrests(interestsValue)
                }
            }
        }
        getInterests()
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <TopicInput onPress={value=>addInterests(value)}/>
            <FlatList
                data={myIntrests}
                keyExtractor={(item) => item.toString()}
                numColumns={2}
                renderItem={({ item }) => (
                    <TopicPill 
                        topic={item} 
                        addIt={myIntrests.includes(item) ? true : false} 
                        onPress={()=>removeInterests(item)}
                    />
                )}    
            />
        </View>
    )
};

const Profile = () => {
    const [profile, setProfile] = useState({});
    const navigation = useNavigation();
    const { colors } = useTheme();
    
    useEffect(()=>{
        async function profileData() {
            const profileData = await dataManagment.pull('@user')
            if (profileData) {
                setProfile(profileData)
            }
        };
        profileData()
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView >
                <View style={{height: sizeHint.Y(.09), justifyContent: 'center'}}>
                    <BoredText text={profile ? profile.email : 'Email'} />
                </View>
                <PasswordChange navigation={router} />
                <Dividers />
                <SearchSetting navigation={router} profile={profile} themeColor={{text: colors.text, background: colors.background}}/>
                <Dividers />
                <WebViewButton />
                <Dividers />
                <PersonalizedAds navigation={navigation} />
                <Dividers />
                <Privacy navigation={router} />
                <Dividers />
                <DeleteViews />
                <Dividers />
                <LogOutButton navigation={navigation} />
                <DeleteAccount navigation={navigation} />
            </ScrollView>
        </View>
    )
};


const TopTab = createMaterialTopTabNavigator();

export default AccountTabs = () => {
  return (
    <TopTab.Navigator>
      <TopTab.Screen name="profile" component={Profile} />
      <TopTab.Screen name="interests" component={Intrests} />
    </TopTab.Navigator>
  );
}
