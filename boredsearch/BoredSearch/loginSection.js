import React, { useState, useRef } from 'react';
import { useTheme } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

import { BoredText } from './texts';
import { Sizehint, ScreenView } from './dimensions';
import { NewTopicsFeed, AdaptiveView, CodeVerification, LoadingPopUp } from './layouts';
import { PasswordInput, EmailInput } from './inputs';
import { BoredAlert, ActionBoredAlert } from './popups';
import { LightToast, newUserTopics } from './tools';
import { BoredButton } from './buttons';
import { LoginLogic, RegisterLogic, ForgotLogic } from './logicBored';
import NetInfo from "@react-native-community/netinfo";

//Views that are actually displayed on the login modals

const appRegister = new RegisterLogic();
const forgetLogic = new ForgotLogic();
const sizeHint = new Sizehint();
const screenViewDimension = new ScreenView();
const Toast = new LightToast();
const appLogin = new LoginLogic();
const Grey = 'rgb(105,105,105)'


const Login = ({onSubmit, width, screenChange}) => {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submit, setSubmit] = useState(false);
    const [emailBorder, setEmailborder] = useState(Grey);
    const [passwordBorder, setPasswordborder] = useState(Grey);
    const emailErrorMessage = useRef('User not found');
    const passwordMessage = useRef('Enter Password');

    function resetBorders(color) {
        setEmailborder(color)
        setPasswordborder(color)
    };

    async function login(){
        setSubmit(true)
        emailErrorMessage.current = 'User not found'
        resetBorders(colors.text)
        if (email == ''){
            emailErrorMessage.current = 'Please enter email'
            setEmailborder('red')
            setSubmit(false)
        }
        else if (password == ''){
            passwordMessage.current = 'Enter Password'
            setPasswordborder('red')
            setSubmit(false)
        }
        else {
            if ((await NetInfo.fetch()).isConnected){            
                const loginData = {email: email, password: password}
                const loginResult = await appLogin.login(loginData)
                if (loginResult.status == 300) {
                    passwordMessage.current = ''
                    setPasswordborder('red')
                }
                else if (loginResult.status == 301) {
                    setEmailborder('red')
                }
                else if (loginResult.status == 200) {
                    setEmail('')
                    setPassword('')
                    onSubmit(loginResult.isTemp)
                }
                else {
                    Toast.toast('Network Error')
                }
                setSubmit(false)
            }
            else{
                setSubmit(false)
                Toast.toast('No Connection')
            }
        }
    };


    return (
        <ScrollView style={styleSheet.screenView} contentContainerStyle={styleSheet.loginScreenView}>
            <EmailInput 
                placeHolder='Email' 
                appWidth={width} 
                email={email} 
                emailBorder={emailBorder} 
                message={emailErrorMessage.current} 
                typeEmail={text=>setEmail(text)} 
            />
            <PasswordInput 
                typePassword={(text) => setPassword(text)} 
                appWidth={width} 
                password={password} 
                passwordBorder={passwordBorder} 
                message={passwordMessage.current}
            />
            <>
                {submit ? <ActivityIndicator size='large'/> : 
                    <>
                        <BoredButton fill text='Login' customizeTextColor='white' onPress={()=>login()} />
                        <BoredButton fill text='Sign Up' customizeTextColor='white' onPress={() => screenChange('register')}/>
                    </>
                }
            </>
            <TouchableOpacity style={[styleSheet.centerAlign, {height: sizeHint.Y(.06)}]} onPress={() => screenChange('forgot')}>
                <BoredText text='Forgot Password?' textStyle={{fontSize:15}} />
            </TouchableOpacity>
        </ScrollView>
    )
};


const PasswordForget = ({screenChange}) => {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [submit, setSubmit] = useState(false);
    const [emailBorder, setEmailborder] = useState(Grey);
    const emailErrorMessage = useRef('User not found');

    function resetBorders(color) {
        setEmailborder(color)
    };

    const emailSuccessful = () => { 
        screenChange('login')
    };

    async function submitRequest(){
        setSubmit(true)
        emailErrorMessage.current = 'User not found'
        resetBorders(colors.text)
        if (email == ''){
            emailErrorMessage.current = 'Please enter email'
            setEmailborder('red')
            setSubmit(false)
        }
        else {
            if ((await NetInfo.fetch()).isConnected) {
                const passwordRequest = await forgetLogic.emailRequest(email)
                if (passwordRequest.status == 200) {
                    ActionBoredAlert('Reset email has been sent', ()=>emailSuccessful())
                }
                else if (passwordRequest.status == 300) {
                    emailErrorMessage.current = 'User not found'
                    setEmailborder('red')
                    setSubmit(false)
                }
                else {
                    setSubmit(false)
                    Toast.toast('Network Error')
                }
            }
            else {
                setSubmit(false)
                Toast.toast('No Connection')
            }
        }
    };

    return (
        <ScrollView style={styleSheet.screenView}>
            <AdaptiveView style={styleSheet.loginScreenView} viewWidth={1} viewHeight={.6}>
                <EmailInput 
                    placeHolder='Email' 
                    emailBorder={emailBorder} 
                    message={emailErrorMessage.current} 
                    email={email} 
                    typeEmail={text=>setEmail(text)} 
                />
                <>
                    {submit ? <ActivityIndicator size='large' /> :
                        <>
                            <BoredButton fill text='Submit' customizeTextColor='white' onPress={()=>submitRequest()} />
                            <BoredButton fill text='Cancel' customizeTextColor='white' onPress={()=>screenChange('login')} />
                        </>
                    }
                </>
            </AdaptiveView>
        </ScrollView>
    )
};


const RegisterForm = ({openConfirmation, textEmail, textPassword, textConfirm, email, password, confirmPassword, emailBorder, onCancel}) => {
    const [borderColor, setBordercolor] = useState(Grey);
    const passwordMessage = 'Passwords Must Match';
    const notOk= [101, 102];

    function nextPage() {
        const data = {email: email.toLowerCase(), password: password, confirmPassword: confirmPassword}
        const preCheck = appRegister.preRegCheck(data)
        if (preCheck.status==1) {
            BoredAlert(preCheck.message)
        }
        else if (preCheck.status==2 || preCheck.status==3) {
            setBordercolor('red')
        }
        else if (preCheck==0) {
            Toast.toast('Network Error')
        }
        else if (notOk.includes(preCheck.status)) {
            BoredAlert(preCheck.message)
        }
        else if (preCheck==200){
            openConfirmation()
        }
    };

    function typeEmail(text) {
        textEmail(text)
    };

    function typePassword(text) {
        textPassword(text)
    };

    function typeConfirmPassword(text) {
        textConfirm(text)
    };

    return (
        <ScrollView style={styleSheet.screenView}>
            <AdaptiveView style={styleSheet.registerScreenView} viewWidth={1} viewHeight={.6}>
                <EmailInput 
                    placeHolder='Email' 
                    email={email} 
                    emailBorder={emailBorder} 
                    typeEmail={text=>typeEmail(text)} 
                />
                <PasswordInput 
                    message={passwordMessage}  
                    passwordBorder={borderColor} 
                    password={password} 
                    typePassword={text=>typePassword(text)} 
                    bordColor={borderColor} 
                />                
                <PasswordInput 
                    placeHolder='Confirm Password' 
                    message={passwordMessage} 
                    passwordBorder={borderColor} 
                    password={confirmPassword} 
                    typePassword={text=>typeConfirmPassword(text)} 
                    bordColor={borderColor} 
                />
                <BoredButton fill text='Next' customizeTextColor='white' onPress={()=>nextPage()} />
                <BoredButton fill text='Cancel' customizeTextColor='white' onPress={() => onCancel('login')} />
            </AdaptiveView>
        </ScrollView>
    )
};



const IntrestsForm = ({backOne, onSubmit, registrationComplete}) => {
    const [chosen, setChosen] = useState([]);
    const [submit, setSubmit] = useState(false);
    const saveData = useRef([]);


    function backToRegistration(value) {
        backOne(value)
    };

    async function signUp() {
        if ((await NetInfo.fetch()).isConnected) {
            setSubmit(true)
            const registerResult = await onSubmit(saveData.current.join(','))
            if (registerResult.status==0) {
                if (registerResult.message) {
                    setSubmit(false)
                    backToRegistration('email')
                }
                else {
                    Toast.toast('Network Error')
                    setSubmit(false)
                    backToRegistration()
                }
            }
            else if (registerResult.status==200) {
                registrationComplete()
                setSubmit(false)
            }
            else {
                Toast.toast('Network Error')
                setSubmit(false)
                backToRegistration()
            }
        }
        else {
            Toast.toast('No Connection')
        }
    };

    function addOrremove(choice) {
        const updateChoice = chosen.slice();
        if (updateChoice.includes(choice)){
            const chosenList = updateChoice
            for (let choices in chosenList) {
                if (chosenList[choices]==choice){
                    chosenList.splice(choices, 1)
                    saveData.current.splice(choices, 1)
                }
            }
            setChosen(chosenList)
        }
        else {
            updateChoice.push(choice)
            saveData.current.push(choice.toLowerCase())
            setChosen(updateChoice)
        }
    };

    return (
        <View style={styleSheet.screenView}>
            <NewTopicsFeed list={newUserTopics} chosenList={chosen} onPress={value=>addOrremove(value)}/>
            <>
                {submit ? 
                    <ActivityIndicator size='large' /> 
                    :
                    <View style={{ width: '100%', height: '15%', justifyContent: 'space-around', alignItems: 'center'}}>
                        <BoredButton fill text='Sign Up' customizeTextColor='white' submit={submit} onPress={()=>signUp()} />
                        <BoredButton fill text='Back' customizeTextColor='white' submit={submit} onPress={()=>backToRegistration()} />
                    </View>
                }
            </>
        </View>
    )
};


const RegisterScreen = ({screenChange, changeLoginStatus}) => {
    const [currentView, setCurrentview] = useState('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmpassword] = useState('');
    const [emailBoreder, setEmailborder] = useState(Grey);
    const [code, setCode] = useState();
    const [loading, setLoading] = useState(false);
    const actualCode = useRef('');
    const doneVerifiying = useRef(false);

    async function generateCode(resent=false) {
        setLoading(true)
        const networkResult = await appRegister.verificationProcess(email.toLowerCase())
        if (networkResult.status==200){
            actualCode.current = networkResult.code
            if (!resent) {
                setCurrentview('confirm')
            }
        }
        else if (networkResult.status==202){
            setEmailborder('red')
        }
        else{
            Toast.toast('Network Error')
        }
        setLoading(false)
    }

    function resendCode() {
        generateCode(true)
        appRegister.verificationProcess(email.toLowerCase())
    }

    if (code==actualCode.current){
        if (doneVerifiying.current==true){
            //pass
        }
        else {
            doneVerifiying.current = true
            setCurrentview('intrests');
        }
    }

    function pageChange(page){
        setCurrentview(page)
    }

    function backOne(error) {
        setCurrentview('register')
        if (error=='email'){
            setEmailborder('red')
        }
    };

    function registrationComplete() {
        setEmail('')
        setPassword('')
        setConfirmpassword('')
        setEmailborder(Grey)
        changeLoginStatus('login', screenViewDimension.getScreenDimension('width'))
    };

    async function signUp(data) {
        const registerData = {username: email.toLowerCase(), password: password, interests: data}
        const registerResult = await appRegister.signUp(registerData)
        return registerResult 
    };
    
    if (currentView=='register') {
        return (
            <>
                <LoadingPopUp modalVisible={loading} />
                <RegisterForm 
                    openConfirmation={()=>generateCode()}
                    textEmail={text=>setEmail(text)} 
                    textPassword={text=>setPassword(text)}
                    textConfirm={text=>setConfirmpassword(text)}
                    email={email}
                    password={password}
                    confirmPassword={confirmpassword}
                    emailBorder={emailBoreder}
                    onCancel={(name)=>screenChange(name)}
                />
            </>
        )
    }
    else if (currentView=='confirm') {
        return (
            <ScrollView style={styleSheet.screenView} contentContainerStyle={{flex: 1, alignItems: 'center', width: '100%'}}>
                <View style={{width: '100%', alignItems: 'center', height: '100%'}}>
                    <CodeVerification 
                        email={email} 
                        actualCode={actualCode.current} 
                        onComplete={()=>pageChange('intrests')} 
                        setCode={code=>setCode(code)} 
                        resend={()=>resendCode()} 
                    />
                </View>
            </ScrollView>
        )
    }
    else {
        return (
            <IntrestsForm 
                backOne={(value)=>backOne(value)} 
                onSubmit={data=>signUp(data)}
                registrationComplete={()=>registrationComplete()}
            />
        )
    }
};


const styleSheet = StyleSheet.create({
    centerAlign: {
        justifyContent: 'center', 
        alignItems: 'center'
    },
    screenView: {
        flex: 1, 
        width: '100%',
    },
    loginScreenView: {
        flex: 1,
        justifyContent: 'space-around', 
        alignItems: 'center', 
    },
    registerScreenView: {
        justifyContent: 'space-around', 
        alignItems: 'center'
    },
})


export {
    Login,
    RegisterScreen,
    PasswordForget
}