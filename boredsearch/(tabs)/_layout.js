import { Tabs, router } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeProvider, DarkTheme, useTheme } from '@react-navigation/native';
import { Sizehint } from '../BoredSearch/dimensions';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BoredSearchDataManagment, BoredSearchColors } from '../BoredSearch/tools';
import { DarkLight, BoredShuffle } from '../BoredSearch/buttons';
import { LightToast } from '../BoredSearch/tools';
import { Modal, View } from 'react-native';
import { Login, RegisterScreen, PasswordForget } from '../BoredSearch/loginSection';
import { EventRegister } from 'react-native-event-listeners';

const dataManagment = new BoredSearchDataManagment()
const Toast = new LightToast()
const sizeHint = new Sizehint()

//Modal used for login, sign up and password reset instead of screen navigation
const LoginModal = ({visible, changeLoginStatus}) => {
  const [screen, setScreen] = useState('login')
  const { colors } = useTheme();

  function changeScreen(screenName) {
    setScreen(screenName)
  }
  
  return (
    <Modal transparent={true} visible={visible} animationType='slide'>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card}}>
        {screen=='login' ? 
          <Login 
            onSubmit={(tempPassword)=>changeLoginStatus(tempPassword)} 
            width={sizeHint.X(1)} 
            screenChange={(nameOfscreen)=>changeScreen(nameOfscreen)} 
          /> 
          : 
          screen=='register' ? 
            <RegisterScreen 
              screenChange={(nameOfscreen)=>changeScreen(nameOfscreen)} 
              changeLoginStatus={(login, width)=>changeLoginStatus(login, width, null)}
            /> 
          : 
          <PasswordForget navigation={router} screenChange={(nameOfscreen)=>changeScreen(nameOfscreen)}/>}
      </View>
    </Modal>
  )
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  //choice used to indicate current mode
  const choice = useRef(0);
  const appearance = ['system', 'light', 'dark'];

  const [theme, setTheme] = useState(null)
  const [visible, setVisible] = useState(true)

  const istempPassword = useRef(false);
  const appearanceMode = useRef()
  const [indexing, setIndexing] = useState(1)

  useEffect(()=>{
    EventRegister.addEventListener('logout', () => {
      EventRegister.emit('loggedIn', 'out')
      setVisible(true)
    });
    return () => {
      EventRegister.removeAllListeners()
    };
  }, [indexing]);

  useEffect(() => {
    async function startUp() {
      const appearanceValue = await dataManagment.pull('@appearance')
      if (appearanceValue) {
        appearanceMode.current = appearanceValue.appearance 
        const appearMode = appearanceValue.appearance
        if (appearMode === 'dark') {
          choice.current = 2
          appearanceMode.current = 'dark'
          setTheme(BoredSearchColors.BoringDark)
        }
        else if (appearMode === 'system'){
          choice.current = 0
          if (colorScheme === 'dark') {
            appearanceMode.current = 'dark'
            setTheme(BoredSearchColors.BoringDark)
          }
          else {
            appearanceMode.current = 'light'
            setTheme(BoredSearchColors.BoringLight)
          }
        }
        else {
          choice.current = 1
          appearanceMode.current = 'light'
          setTheme(BoredSearchColors.BoringLight)
        }
      }
      else {
        if (colorScheme === 'dark') {
          choice.current = 2
          appearanceMode.current = 'dark'
          setTheme(BoredSearchColors.BoringDark)
        }
        else {
          choice.current = 1
          appearanceMode.current = 'light'
          setTheme(BoredSearchColors.BoringLight)
        }
      }
      const userLoginData = await dataManagment.pull('@user')
      if (userLoginData) {
        setVisible(false)
        const tempPasswordData = await dataManagment.pull('@tempPassword')
        if (tempPasswordData){
          istempPassword.current = userLoginData.password
          router.push('/password')
        }
      }
    }
    startUp()
    }, []);

  function darkLightMode() {
    var toastMessage = ''
    var count = choice.current + 1
    choice.current = choice.current + 1
    if (choice.current==3){
      choice.current = 0
      count = 0
    }
    if (appearance[count]=='dark'){
      appearanceMode.current = 'dark'
      toastMessage = 'Dark Mode'
      setTheme(BoredSearchColors.BoringDark)
    }
    else if (appearance[count]=='light') {
      appearanceMode.current = 'light'
      toastMessage = 'Light Mode'
      setTheme(BoredSearchColors.BoringLight)
    }
    else if (appearance[count]=='system') {
      toastMessage = 'System Mode'
      if (colorScheme==='dark') {
        appearanceMode.current = 'dark'
        setTheme(BoredSearchColors.BoringDark)
      }
      else {
        appearanceMode.current = 'light'
        setTheme(BoredSearchColors.BoringLight)
      }
    }
    saveData(appearance[count])
    Toast.toast(toastMessage)
  }

  async function saveData(value) {
    appearanceMode.current = value
    const data = {appearance: value}
    await dataManagment.save('appearance', data)
  };

  function loginStatus(tempPassword=null) {
    if (tempPassword){  
      EventRegister.emit('loggedIn', tempPassword)
    }
    else {
      EventRegister.emit('loggedIn', 'in')
    }
    setVisible(false)
  }

  
  return (
    <ThemeProvider value={theme ? theme : DarkTheme}>
      <LoginModal visible={visible} changeLoginStatus={(tempPassword)=>loginStatus(tempPassword)} />
      <Tabs
        screenListeners={
          {
            //listens for custom home button press
            // either navigates home or refresh feed 
            tabPress: (e) => {
              if (e.target.split('-')[0]=='index'){
                EventRegister.emit('refresh')
              }
            },
            state: (s) => {
              setIndexing(s.data.state.index)
            },
          }
        }
      >
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            headerRight:() => (
              <DarkLight mode={appearanceMode.current} onPress={()=>darkLightMode()}/>
            ), 
            tabBarIcon: ({color, size}) => (
              <MaterialCommunityIcons name='account-outline' color={color} size={size} />
            ),
            tabBarShowLabel: false,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: true,
            tabBarIcon: ({focused, color, size}) => (
              <>
                { focused ? 
                  <BoredShuffle /> :
                  <MaterialCommunityIcons name='home-outline' color={color} size={size}/>
                }
              </>
            ),
            tabBarShowLabel: false,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            headerShown: true,
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons name={focused ? 'folder-star' : 'folder-star-outline'} color={color} size={size}/>
            ),
            tabBarShowLabel: false
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
