import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';
import { Dimensions } from 'react-native';
import { ScreenView } from './BoredSearch/dimensions';
import { FlipSplash } from './BoredSearch/popups';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const screenViewDimension = new ScreenView();

export default function RootLayout() {
  const [orientationView, setOrientationview] = useState(screenViewDimension.orientationCheck());
  const [splash, setSplash] = useState(false);
  const currentScreenView = useRef('');
  const currentScreenWidth = useRef();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
    
  useEffect(()=>{
    //listens for foldable devices opening and closing
    const listen = Dimensions.addEventListener('change', status => {
      if (status.window.width>currentScreenWidth.current){
        setOrientationview('landscape')
      }
      else {
        setOrientationview('portrait')
      }
      currentScreenWidth.current = status.window.width
      //uses a view to cover screen as sometimes componets flip around 
      //before setting properly
      setSplash(true)
      closeSplash()
    });
    return () => {
      listen.remove()
    }
  }, [orientationView]);

  useEffect(() => {
      if (loaded) {
        //checks if foldable is currently in tablet or handset view 
        const displayView = screenViewDimension.columnCheck();
        currentScreenWidth.current = screenViewDimension.getScreenDimension('width')
        if (displayView>1) {
          currentScreenView.current='Tablet'
          setOrientationview('landscape')
        }
        else {
          currentScreenView.current='Handset'
        }
        SplashScreen.hideAsync();
      }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  function closeSplash(){
    setTimeout(function () {
      setSplash(false);
    }, 2000);
  }


  return (
    <>
      <FlipSplash visible={splash} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, orientation: orientationView }}/>
        <Stack.Screen name="+not-found" /> 
        <Stack.Screen name="browser"/>
        <Stack.Screen name="favoritescreen"/>
        <Stack.Screen name="password" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}
