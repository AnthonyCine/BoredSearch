import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { EventRegister } from 'react-native-event-listeners';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { DeviceFeed } from '../BoredSearch/feeds';
import { ScreenView, Sizehint } from '../BoredSearch/dimensions';
import { PageChange, Search } from '../BoredSearch/layouts';
import { FavoritesDialog, SearchType } from '../BoredSearch/popups';
import { LightToast, BoredSearchColors } from '../BoredSearch/tools';
import { BoredLogic } from '../BoredSearch/logicBored';
import NetInfo from "@react-native-community/netinfo";
import { useNavigation, router } from 'expo-router';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { SearchToggle } from '../BoredSearch/buttons';


const screenViewDimension = new ScreenView();
const Toast = new LightToast();
const sizeHint = new Sizehint()
const sitesLogic = new BoredLogic();


export default Home = () => {
    const { colors } = useTheme();
    const [feed, setFeed] = useState([]);
    const [visible, setVisible] = useState(false);
    const [searchVisible, setSearchvisible] = useState(false);
    const [openSearch, setOpensearch] = useState(false);
    const [fetching, setFetching] = useState(false)
    //curStatus keeps track of user logged in or out
    const [curStatus, setCurstatus] = useState('out')
    const pageNum = useRef(null);
    const backupPageNum = useRef();
    const typeOfContent = useRef('');
    const searchId = useRef();
    const title = useRef();
    const link = useRef();
    const searchesText = useRef('');
    const orientation = useRef('');
    const buttonActive = useRef();
    const navigation = useNavigation();
    const inFocus = useIsFocused();

    const addVisible = (value) => setVisible(value);

    function searchActive() {
        if (buttonActive.current==colors.background){
            buttonActive.current = BoredSearchColors.BoredBlue
            setOpensearch(true)
        }
        else if (buttonActive.current==BoredSearchColors.BoredBlue) {
            buttonActive.current = colors.background
            setOpensearch(false)
        }
        else {
            buttonActive.current = BoredSearchColors.BoredBlue
            setOpensearch(true)
        }
    };

    useEffect(()=>{
        navigation.setOptions({
            headerRight: () => (
                <View style={{ paddingRight: '2%' }}>
                  <SearchToggle appWidth={sizeHint.X(1)} onPress={()=>searchActive()}/>
                </View>
              ),
        })
    },[])

    useEffect(()=>{
        EventRegister.addEventListener('loggedIn', data => {
            if (data=='in'){
                router.push({pathname: '/(tabs)/'})
                reShuffle()
                setCurstatus('in')
            }
            else if (data=='out') {
                router.push({pathname: '/(tabs)/'})
                setFeed([])
                setCurstatus('out')
            }
            else {
                router.push({pathname: '/password'})
                setCurstatus('in')
            }
        });
        return () => {
            EventRegister.removeAllListeners();
        }
    }, [curStatus]);
    
    useEffect(()=>{
        EventRegister.addEventListener('refresh', () => {
            if (inFocus){
                reShuffle()
            }
        });
        return () => {
            EventRegister.removeAllListeners();
        }
    }, [inFocus, curStatus]);
    
    useEffect(()=>{
        async function pullBored() {
            const connectionResult = await NetInfo.fetch()
            const connectionData = connectionResult.isConnected
            //supports handsets as well tablets 
            // orientationCheck will verify which view and will switch if foladable accordingly
            orientation.current = screenViewDimension.orientationCheck()
            if (connectionData){
                const data = await sitesLogic.pullContents()
                if (data.length==0){
                    setFeed([{"id": "empty"}])
                }
                else { 
                    setFeed(data)
                }
            }
            else {
                setFeed([{id: 'empty'}])
                Toast.toast('No Connection')
            }
        }
        pullBored()
    }, []);

    async function createFolder(siteTitle, siteLink, siteId) {
        searchId.current = siteId
        title.current = siteTitle
        link.current = siteLink
        setVisible(true)
    };
        
    async function reShuffle() {
        if (pageNum.current != null){
            pageNum.current = null
        }
        setFeed([])
        if ((await NetInfo.fetch()).isConnected) {
            const data = await sitesLogic.pullContents()
            setFeed(data)
        }
        else{
            setFeed([{id: 'empty'}])
            Toast.toast('No Connection')
        }
    };

    async function searchContent(contentType) {
        setFeed([])
        typeOfContent.current = contentType
        pageNum.current = 0 
        let keyword
        if (searchesText.current == '' || searchesText.current == ' '){
            searchesText.current = 'random'
            keyword = 'random' 
        }
        else {
            keyword = searchesText.current.trim()
        }
        //sitesLogic.search(keyword=keyword, contentType=site, image, etc, \
        // direction=retreieve the next set of contents or the previous, requestPage=starting index)
        const searchResult = await sitesLogic.search(keyword, contentType, 'next', 0)
        if (searchResult.BoredMessage){
            setFeed([{id: 'empty', BoredMessage: searchResult.BoredMessage}])
        }
        else {
            pageNum.current = searchResult.page
            setFeed(searchResult.data)
        }
    };

    function searchKeyword(keyword) {
        searchesText.current = keyword.trim()
        setSearchvisible(true)
    };

    async function pageChange(direction){
        setFetching(true)
        let requestPage
        if (pageNum.current=='end' && direction=='back'){
            requestPage = backupPageNum.current-15
        }
        else if (direction=='back'){
            requestPage=pageNum.current-15
        }
        else if (direction=='next'){
            requestPage=pageNum.current+15
        }

        const keyword = searchesText.current
        const contentType = typeOfContent.current
        const searchResult = await sitesLogic.search(keyword, contentType, direction, requestPage)
        if (searchResult.page=='end'){
            pageNum.current='end'
            backupPageNum.current = searchResult.count
        }
        if (searchResult.BoredMessage){
            setFeed([{id: 'empty', BoredMessage: searchResult.BoredMessage}])
        }
        else {
            pageNum.current = searchResult.page
            setFeed(searchResult.data)
        }
        setFetching(false)
    }
            
    if (feed.length==0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size='large' />
            </View>
        )
    }
    else {
        return (
            <View style={{flex:1, alignItems:'center'}}>
                <FavoritesDialog 
                    addVisible={addVisible} 
                    visible={visible} 
                    title={title.current} 
                    link={link.current} 
                    id={searchId.current} 
                    close={()=>setVisible(false)}
                />
                <SearchType 
                    searchTypeShow={searchVisible} 
                    searchTypeHide={value=>setSearchvisible(value)} 
                    onPress={(engine)=>searchContent(engine)} 
                    close={()=>setSearchvisible(false)}
                />
                <View style={styleSheet.screenView}>
                    {openSearch ? 
                        <View style={{ width:'100%', alignItems:'center', paddingBottom:'3%' }}>
                            <Search openType={(search)=>searchKeyword(search)} />
                        </View> 
                        : 
                        null
                    }
                    <DeviceFeed 
                        feed={feed} 
                        navigation={router} 
                        initialAmount={screenViewDimension.columnCheck()} 
                        createFolder={(postTitle, postLink, postId)=>createFolder(postTitle, postLink, postId)} 
                        orientation={orientation.current}
                    />
                    {
                        pageNum.current != null ? 
                            <PageChange onPress={direction => pageChange(direction)} page={pageNum.current} loading={fetching} /> 
                            : 
                            null
                    }
                </View>
            </View>
        )
    }
};


const styleSheet = StyleSheet.create({
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
