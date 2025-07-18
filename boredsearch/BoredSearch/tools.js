import axios from "axios";
import { Platform, ToastAndroid } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";


const BoredSearchColors = {
    Grey: 'rgb(105,105,105)',
    BoredBlue: "rgba(50, 100, 168, 0.8)",
    BoredThemeNoOpacity: "rgb(50, 100, 168)",
    BoringDark: { "colors": { "background": "rgb(1, 1, 1)", "border": "rgb(39, 39, 41)", "card": "rgb(18, 18, 18)", "notification": "rgb(255, 69, 58)", "primary": "rgba(50, 100, 168, 0.5)", "text": "rgb(229, 229, 231)" }, "dark": true },
    BoringLight: { "colors": { "background": "rgb(242, 242, 242)", "border": "rgb(216, 216, 216)", "card": "rgb(255, 255, 255)", "notification": "rgb(255, 59, 48)", "primary": "rgba(50, 100, 168, 0.8)", "text": "rgb(28, 28, 30)" }, "dark": false }
}

class LightToast {

    toast = (message) => {
        if (Platform.OS == 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        }
        else {
            EventRegister.emit('toast', message)
        }
    }
};


class BoredSearchNetwork {

    constructor() {
        this.timeout = 6000
        this.url = "Add URL"
    };

    isThereConnection = async () => {
        const connectionResult = await NetInfo.fetch()
        return connectionResult
    };


    getInterests = async () => {
        const userInterests = await AsyncStorage.getItem('@interests')
        const data = userInterests != null ? JSON.parse(userInterests) : 'random';
        const interests = data != '' ? data.toString().split(',').join('_') : 'random'
        return interests
    };

    getNetworkHeader = async () => {
        const profileData = await AsyncStorage.getItem('@user')
        if (profileData) {
            const data = profileData != null ? JSON.parse(profileData) : null;
            const token = data.token
            const head = { 'Authorization': `Token ${token}` }
            return head
        }
    };

    getUserData = async () => {
        const profileData = await AsyncStorage.getItem('@user')
        if (profileData) {
            const data = profileData != null ? JSON.parse(profileData) : null;
            return data.email
        }
    };

    getSettingsData = async () => {
        const profileData = await AsyncStorage.getItem('@user')
        if (profileData) {
            const data = profileData != null ? JSON.parse(profileData) : null;
            return data.settings
        }
    };

    register = async (data) => {
        var newUserData={}
        const url = `${this.url}/users/new_user/`
        await axios({
            url: url,
            method: 'POST',
            data: JSON.stringify(data),
            timeout: this.timeout
        })
        .then((res) => {
            newUserData.data=res.data
            newUserData.status=res.status
        })
        .catch((error) => {
            newUserData.test=error
            newUserData.status=error.response.status
            newUserData.data=error.response.data
        })
        return newUserData
    };

    login = async (data) => {
        var userData={}
        const url = `${this.url}/users/returning_user/`
        await axios({
            url: url,
            method: 'POST',
            data: JSON.stringify(data),
            timeout: this.timeout
        })
        .then((res) => {
            userData=res.data
            userData.status=res.status
        })
        .catch((error) => {
            userData.status=error.response.status
        })
        return userData
    };

    forgottenPassword = async (data, passwordType) => {
        const url = `${this.url}/reset_password/email_verification/${passwordType}/`
        let result={}
        await axios({
            url: url,
            method: 'POST',
            data: JSON.stringify(data),
            timeout: this.timeout
        })
        .then((res) => {
            result.status=res.status
        })
        .catch((error) => {
            result.status=error.response.data
            result.data=error.response.data
        })
        return result
    };

    emailVerification = async () => {
        const url = `${this.url}/verify/resend/email/`
        let result = {}
        const email = await this.getUserData()
        let data = JSON.stringify(email)
        await axios({
            url: url,
            method: 'POST',
            timeout: this.timeout,
            data: data
        })
        .then((res) => {
            result.status=res.status
        })
        .catch(() => {
            result.status=0
        })
        return result
    };

    codeVerification = async (email) => {
        const url = `${this.url}/verify/new/account/`
        let result = {}
        let data = JSON.stringify({email: email})
        await axios({
            url: url,
            method: 'POST',
            timeout: this.timeout,
            data: data
        })
        .then((res) => {
            result.testData=res.data
            result.status=res.status
            result.code=res.data.code 
        })
        .catch(() => {
            result.status=0
        })
        return result
    }

    homeScreen = async (searchAmount, contentTypes) => {
        var interests = await this.getInterests()
        interests = interests.toString()
        const url = `${this.url}/main_bored/${searchAmount}/${contentTypes}/${interests}/`
        var contents={}
        const header = await this.getNetworkHeader()
        await axios({
            url: url,
            method: 'GET',
            headers: header,
            timeout: this.timeout
        })
        .then((res) => {
            contents.data=res.data
            contents.status=res.status
        })
        .catch((error) => {
            contents.status=error.response.status 
            contents.data=error.response.data
        })
        return contents
    };

    search = async (search, contentType, direction, page) => {
        let result={}
        let showSafe = 'False'
        const settingsType = await this.getSettingsData() 
        if (settingsType.includes("Safe Search")){
            showSafe = 'True'
        }
        const url=`${this.url}/search/${search}/${contentType}/${direction}/${page}/${showSafe}/`
        await axios({
            url: url,
            method: 'GET',
            headers: await this.getNetworkHeader(),
            timeout: this.timeout
        })
        .then((res) => {
            result.data=res.data.data
            result.page=res.data.page
            result.BoredMessage = res.data.BoredMessage
            result.count=res.data.count
            result.status=200 
        })
        .catch((error) => {
            result.status=0 
            result.data=error.response.data
        })
        return result
    };

    changePassword = async (newPassword) => {
        const url=`${this.url}/change_password/`
        var resultData={}
        await axios({
            url: url,
            method: 'POST',
            data: JSON.stringify(newPassword),
            headers: await this.getNetworkHeader(),
            timeout: this.timeout
        })
        .then((res) => {
            resultData=res.data.user
            resultData.status=res.status
        })
        .catch((error) => {
            resultData.status=0
            resultData.data=error
        })
        return resultData
    };

    getFavorite = async (favType, folderName) => {
        const url=`${this.url}/favorites/${favType}/${folderName}/`
        var fav={}
        await axios({
            url: url,
            method: 'GET',
            headers: await this.getNetworkHeader(),
            timeout: this.timeout
        })
        .then((res) => {
            fav.status=res.status
            fav.data=res.data.favorites
        })
        .catch((error) => {
            fav.status=0
            if (error.response.status == 401) {
                fav.status=401
            }
            fav.data=error.response.data
        })
        return fav
    };

    favorite = async (newfolder, folder, id) => {
        const url=`${this.url}/favorites/${newfolder}/${folder}/${id}/`
        var fav={}
        await axios({
            url: url,
            method: 'POST',
            headers: await this.getNetworkHeader(),
            timeout: this.timeout
        })
        .then((res) => {
            fav.data=res.data.result
            fav.status=res.status
            fav.reason=res.data.reason
        })
        .catch((error) => {
            fav.status=error.response.status
            fav.data=error.response.data
        })
        return fav
    };

    deleteFavorite = async (deleteType, folder, objectId) => {
        const url=`${this.url}/favorites/${deleteType}/${folder}/${objectId}/`
        var fav={}
        await axios({
            url: url,
            method: 'DELETE',
            headers: await this.getNetworkHeader(),
            timeout: this.timeout
        })
        .then((res) => {
            fav.status=res.status
            fav.allFolders=res.data.updatedFolders
            fav.updatedList=res.data.result
        })
        .catch(() => {
            fav.status=0
        })
        return fav
    };

    updateInterests = async (interests, action) => {
        const url=`${this.url}/interests/${action}/`
        var result={}
        await axios({
            url: url,
            method: 'POST',
            headers: await this.getNetworkHeader(),
            data: JSON.stringify(interests),
            timeout: this.timeout
        })
        .then((res) => {
            result.status=res.status
            result.BoredMessage=res.data.BoredMessage
            result.data=res.data.data
            result.stuff=res
        })
        .catch((e) => {
            result.status=0
            result.data=e.response.data
        })
        return result
    };

    updateSearchSettings = async (settings) => {
        const url = `${this.url}/search_settings/`
        var result={}
        await axios({
            url: url,
            method: 'POST',
            headers: await this.getNetworkHeader(),
            data: JSON.stringify({settings: settings}),
            timeout: this.timeout
        })
        .then((res) => {
            result.status=res.status
        })
        .catch(() => {
            result.status=0
        })
        return result
    };

    updateResultSettings = async (settings) => {
        const url=`${this.url}/result_settings/`
        var result={}
        await axios({
            url: url,
            method: 'POST',
            headers: await this.getNetworkHeader(),
            data: JSON.stringify({ settings: settings }),
            timeout: this.timeout
        })
        .then((res) => {
            result.status=res.status
        })
        .catch(() => {
            result.status=0
        })
        return result
    };

    deleteViews = async () => {
        const url=`${this.url}/views/`
        var result={}
        await axios({
            url: url,
            method: 'DELETE',
            headers: await this.getNetworkHeader(),
            timeout: this.timeout
        })
        .then((res) => {
            result.status=res.status
        })
        .catch(() => {
            result.status=0
        })
        return result
    };

    deleteAccount = async (token) => {
        const url=`${this.url}/users/delete/`
        var result={}
        await axios({
            url: url,
            method: 'DELETE',
            headers: { 'Authorization': `Token ${token}` },
            timeout: this.timeout
        })
        .then((res) => {
            result.status=res.status
        })
        .catch((err) => {
            result.status=0
            result.data=err.response.data
        })
        return result
    }
};



class BoredSearchDataManagment {

    save = async (name, data) => {
        const jsonData = JSON.stringify(data)
        await AsyncStorage.setItem(`@${name}`, jsonData)
    };

    savePullInterests = async (which, data=null) => {
        if (which=='pull'){
            const jsonValue = await AsyncStorage.getItem('@interests')
            const interestsData = jsonValue != null ? JSON.parse(jsonValue) : [];
            return interestsData  
        }
        else if (which=='save'){
            const listData = data.split(',')
            await AsyncStorage.setItem('@interests', JSON.stringify(listData))
        }
    }

    pull = async (name) => {
        var data
        try {
            const jsonValue = await AsyncStorage.getItem(`${name}`)
            data = jsonValue != null ? JSON.parse(jsonValue) : null;
        }
        catch (e) {
            data = null
        }
        return data
    };

    removeAllFavsandFolders = async () => {
        const deleteThese = ['favorites', 'folders']
        for (let deleteThis in deleteThese){
            await this.save(deleteThese[deleteThis], [])   
        }
    };

    remove = async () => {
        const deleteThese = ['@appearance', '@favorites', '@folders', '@interests', '@user', '@weboptions']
        await AsyncStorage.multiRemove(deleteThese)   
    };

    getSearchSettings = async () => {
        let searchParam = []
        const profileData = await AsyncStorage.getItem('@user')
        const data = profileData != null ? JSON.parse(profileData) : null;
        if (data) {
            const settings = data.settings
            for (let setting in settings){
                if (settings[setting] == "Safe Search") {
                    searchParam.push('safe')
                }
                else if (settings[setting] == "Images") {
                    searchParam.push('image')
                }
                else if (settings[setting] == "Videos") {
                    searchParam.push('video')
                }
                else if (settings[setting] == "Sites") {
                    searchParam.push('web')   
                }
                else if (settings[setting] == "Quotes") {
                    searchParam.push('text')   
                }
            }
            return searchParam.join('_')
        }
        else {
            return 'all'
        }
    };

    accountData = async () => {
        const userLoginData = await this.pull('@user')
        if (userLoginData) {
            return false
        }
        return true
    }
};


const newUserTopics = [{topic: 'Tech'}, {topic: 'Fashion'}, {topic: 'Politics'}, {topic: 'Travel'}, {topic: 'Humor'}, {topic: 'Decor'}, {topic: 'Photography'}, 
{topic: 'Quotes'}, {topic: 'Pets'}, {topic: 'Cars'}, {topic: 'Cooking'}, {topic: 'Video Games'}, {topic: 'Coding'}, {topic: 'Movies'}, {topic: 'Space'}, 
{topic: 'Artificial Intelligence'}, {topic: 'History'}, {topic: 'Food'}, {topic: 'Poetry'}, {topic: 'Robotics'}
]

const testData = [
    {"id": 0, "title": "", "search_type": "image", "snippet": "", "thumbnail": "https://64.media.tumblr.com/88b6a1f58b5fc2c1bfdb2067ca9469a1/430bbabfdb0e8561-77/s640x960/2823209e558be422166de99f3525c9fc51070f88.jpg", "aspect_ratio": 1.0899414582224587, "source": "tumblr", "topics": "abode,tumblr,grouper2,image", "posted_by": "grouper2", "link": "https://grouper2.tumblr.com/post/753885393277042688/door-collection-also", "publish_ready": false, "main_keyword": "abode", "is_safe": true},
    {"id": 1, "title": "", "search_type": "image", "snippet": "", "thumbnail": "https://64.media.tumblr.com/88b6a1f58b5fc2c1bfdb2067ca9469a1/430bbabfdb0e8561-77/s640x960/2823209e558be422166de99f3525c9fc51070f88.jpg", "aspect_ratio": 1.0899414582224587, "source": "tumblr", "topics": "abode,tumblr,grouper2,image", "posted_by": "grouper2", "link": "https://grouper2.tumblr.com/post/753885393277042688/door-collection-also", "publish_ready": false, "main_keyword": "abode", "is_safe": true}
]

export { BoredSearchDataManagment, BoredSearchNetwork, LightToast, BoredSearchColors, newUserTopics, testData };