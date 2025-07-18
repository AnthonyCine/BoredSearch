import { BoredSearchDataManagment, BoredSearchNetwork } from './tools';
import { EventRegister } from "react-native-event-listeners";

const dataManagment = new BoredSearchDataManagment()
const Network = new BoredSearchNetwork()
const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const SEARCHRESULTS = 15

class InitialSetup {
    setUp = async () => {
        await dataManagment.save('weboptions', {setting: 'In App'})
        await dataManagment.save('appearance', {appearance: 'system'})
        await dataManagment.save('personalAds', {personalized: true})
    }
};

const setUp = new InitialSetup()

class LoginLogic{

    login = async (loginData) => {
        const email = loginData.email
        const password = loginData.password

        if (email=='' || password==''){
            return {status: 1, message: 'Please check login information'}
        }
        else {
            const data = {username: email, password: password}
            const newLoginData = await Network.login(data)
            if (newLoginData.status==200) {
                const loginData = {email: newLoginData.email, password: newLoginData.password, settings: ['Images', 'Videos', 'Sites', 'Quotes', 'Safe Search'], token: newLoginData.token}
                await dataManagment.save('user', loginData)
                await dataManagment.save('interests', newLoginData.interests)
                //temp = temporary passwords
                var temp = false
                if (newLoginData.reset){
                    temp = true
                }
                await dataManagment.save('tempPassword', temp)
                await setUp.setUp()
                var tempPass = false
                if (temp){
                    tempPass = newLoginData.password
                }
                return {status: 200, isTemp: tempPass}
            }
            else if (newLoginData.status==300) {
                return {status: 300, message: 'password'}
            }
            else if (newLoginData.status==301) {
                return {status: 301, message: 'username'}
            }
            else {
                return {status: 0}
            }
        }
    }
};



class RegisterLogic {

    preRegCheck = (registrationData) => {
        const email = registrationData.email
        const password = registrationData.password
        const confirmPassword = registrationData.confirmPassword

        var fixedPassword = password.replace(' ', '')
        var fixedConfirmPassword = confirmPassword.replace(' ', '')
        if (email=='') {
            return {status: 1, message: 'Please Enter an Email'}
        }
        else if (email.match(mailformat) === undefined || email.match(mailformat) === null) {
            return {status: 1, message: 'Invalid Email Address'}
        }
        else if (password=='' ) {
            return {status: 2}
        }
        else if (fixedPassword!=fixedConfirmPassword){
            return {status: 3}
        }
        else{
            if (password.length<8) {
                return {status: 101, message: 'Password Should Be at Least 8 Characters'}
            }
            else if (password.length>12) {
                return {status: 102, message: 'Password Should be Less than 12 Characters'}
            }
            else {
                return 200
            }
        }
    };

    signUp = async (registrationData) => {
        const newUserData = await Network.register(registrationData)
        if (newUserData.status==200) {
            const newSaveData = {email: newUserData.data.email, password: newUserData.data.password, settings: ['Images', 'Videos', 'Sites', 'Quotes', 'Safe Search'], token: newUserData.data.token}
            await dataManagment.save('user', newSaveData)
            await dataManagment.savePullInterests('save', newUserData.data.interests)
            await setUp.setUp()
            return {status: 200}
        }
        else {
            if (newUserData.data.email) {
                return {status: 0, message: newUserData.data.email}
            }
            else {
                return newUserData
            }
        }
    };

    verificationProcess = async (email) => {
       return await Network.codeVerification(email)
    }

    deleteAccount = async () => {
        return await Network.deleteAccount()
    }
};


class ForgotLogic {

    emailRequest = async (email) => {
        const requestResult = await Network.forgottenPassword(email, 'temporary')
        return requestResult
    };
}


class BoredLogic {
    
    pullContents = async () => {
        const searchTypes = await dataManagment.getSearchSettings()
        const data = await Network.homeScreen(SEARCHRESULTS, searchTypes)
        if (data.status==200){
            return data.data.contents
        }
        else {
            if (data.data.detail=="User inactive or deleted.") {
                return [{id: 'inactive'}]
            }
            else {
                return []
            }
        }
    };

    search = async (keyword, contentType, direction, page) => {
        const data = await Network.search(keyword, contentType, direction, page)
        if (data.status==200){
            return data
        }
        else{
            if (data.data.detail=="User inactive or deleted.") {
                return {data: [{id: 'inactive'}]}
            }
            else {
                const errorData = {data: [{id: 'empty'}]}
                return errorData
            }
        }
    };
};



class SettingsLogic {
   
    passwordUpdate = async (original, verifiedOriginal, newPassword, verifiedPassword) => {
        let currentPassword = verifiedOriginal.replace(' ', '')
        let replacementPassword = newPassword.replace(' ', '')
        let verification = verifiedPassword.replace(' ', '')
        if (original==verifiedOriginal) {
            if (currentPassword==replacementPassword) {
                return {status: 0, message: 'New password can not be the same as the old password'}
            }
            else if (replacementPassword==verification && replacementPassword != '') {
                const passwordChangeResult = await Network.changePassword(replacementPassword)
                if (passwordChangeResult.status==200){
                    const saveData = {email: passwordChangeResult.email, password: passwordChangeResult.password, token: passwordChangeResult.token, settings: ['Images', 'Videos', 'Sites', 'Quotes', 'Safe Search']}
                    await dataManagment.save('user', saveData)
                    await dataManagment.save('interests', passwordChangeResult.interests)
                    return {status: 1}
                }
                else {
                    return {status: 0, message: 'Network Error'}
                }
            }
            else {
                return {status: 0, message: 'Please verify password'}
            }
        }
        else {
            return {status: 2, message: 'Incorrect Password'}
        }
    };
};


class IntrestLogic {

    addIntrests = async (intrests, allIntrests) => {
        const interestsList = allIntrests.slice();
        const verifyList = []

        intrests = intrests.trim()

        if (intrests!=''){
            for (let item in interestsList){
                verifyList.push(interestsList[item])
            }
            if (verifyList.includes(intrests)){
                //pass
            }
            else {
                const updateResult = await Network.updateInterests(intrests, 'add')
                if (updateResult.BoredMessage){
                    return {message: updateResult.BoredMessage}
                }
                else {
                    interestsList.push(intrests)
                    await dataManagment.save('interests', interestsList)
                    return interestsList
                }
            }
        }    
    };

    removeIntrests = async (topicName, allIntrests) => {
        const interestsList = allIntrests.slice();
        for (let removeThis in interestsList) {
            if (interestsList[removeThis]===topicName) {
                interestsList.splice(removeThis, 1)
                await dataManagment.save('interests', interestsList)
                await Network.updateInterests(topicName, 'remove')
                return interestsList
            }
        }
    };
};


class FavoriteLogic {

    folderNames = (folders) => {
        let foldersRecieved = []
        let Names = []
        for (let data in folders) {
            foldersRecieved.push(folders[data])
        }
        for (let name in foldersRecieved) {
            Names.push(folders[name].name)
        }
        return Names
    };

    addFolder = async (foldername) => {
        if (foldername.endsWith(' ')) {
            foldername = foldername.replace(' ', '')
        }
        const updatesMade = await Network.favorite('newfolder', foldername, 0)
        //{"reason": {"name": ["folders with this name already exists."]}}
        let folders = updatesMade.data
        let message
        if (updatesMade.reason) {
            message = updatesMade.reason.name[0]
        }
        else if (updatesMade.status==500){
            message = 'Network Error'
            folders = []
        }
        const networkResult = {message: message, folders: folders, status: updatesMade.status}
        return networkResult
    };

    getFolderLocal = async () => {
        const listOfFolders = []
        const folderData = await dataManagment.pull('@folders')
        for (let folder in folderData) {
            listOfFolders.push(folderData[folder])
        }
        return listOfFolders
    };

    getFolderServer = async (favType, folderName) => {
        const folderData = await Network.getFavorite(favType, folderName)
        return folderData
    };

    folderCheck = async () => {
        let returnedData = {}
        const dataResult = await Network.getFavorite('folder', 0)
        if (dataResult.status==0){
            returnedData.message = 'Network Error'
            returnedData.data = []
            returnedData.status = 0
        }
        else if (dataResult.status==401){
            returnedData.status = 401
        }
        else {
            returnedData.status = 200
            returnedData.data = dataResult.data
        }
        return returnedData
    };


    currentFolders = async (foldername) => {
        const current = await this.getFolderLocal()
        const currentNames = []
        for (let name in current) {
            currentNames.push(current[name].name)
        }
        if (currentNames.includes(foldername)) {
            return
        }
        else {
            return true
        }
    };

    favoriteLinks = (data, folder) => {
        const Links = []
        for (let link in data) {
            if (data[link].folder==folder) {
                Links.push(data[link].link)
            }
        }
        return Links
    };

    getSpecificFolder = async (folder) => {
        const folders = await this.getFolderLocal()
        for (let foldername in folders) {
            if (folder==folders[foldername].name) {
                return folders[foldername]
            }
        }
    };

    updateFolders = (folderDate, addition) => {
        for (let item in folderDate) {
            if (folderDate[item].name==addition.name){
                folderDate[item].favored = addition.favored
            }
        }
        return folderDate
    };


    favoriteTitle = (title) => {
        //h.+://(.+\..[a-z]+)
        let newTitle
        if (title!='' && title){
            newTitle = title.toUpperCase()
        }
        return newTitle
    };

    favoriteUrl = (link) => {
        const url = link.replace('//', '/')
        const urlBegining = ['https:', 'http:']
        const splitData = url.split('/')
        const faveUrl = urlBegining.includes(splitData[0]) 
        let linkDisply
        if (faveUrl==true) {
            linkDisply = splitData[1]
        }
        else {
            linkDisply = splitData[0]
        }
        return linkDisply
    };

    favorite = async (requestType, folder, id) => {
        const updatesMade = await Network.favorite(requestType, folder, id)
        EventRegister.emit('updateFavorites', updatesMade.data)
        return updatesMade
    };


    removeFolder = async (folder) => {
        const retreievedFolders = await Network.deleteFavorite('folder', folder, 0)
        return retreievedFolders.updatedList
    };

    removeFavorite = async (id, folder) => {
        const currentFavs = await Network.deleteFavorite('content', folder, id)
        EventRegister.emit('updateFavorites', currentFavs.allFolders)
        return currentFavs.updatedList
    };
 
    specificFavorites = async (folder) => {
        const resultFavorites = await Network.getFavorite('favs', folder)
        return resultFavorites.data
    };


    removeAllFavsAndFolders = async () => {
        await Network.deleteFavorite('all', 0, 0)
        return []
    };

};

export { LoginLogic, RegisterLogic, BoredLogic, SettingsLogic, IntrestLogic, FavoriteLogic, ForgotLogic }