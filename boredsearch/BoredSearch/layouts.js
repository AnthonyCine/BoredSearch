import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Linking, Platform, Dimensions, ActivityIndicator, Keyboard, Text, Modal } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Sizehint, ScreenView, EmergencyTool } from './dimensions';
import { BoredSearchDataManagment, BoredSearchColors } from './tools';
import { TopicPill } from './labels';
import { BoredText, QuotedText } from './texts';
import { FavoriteLogic } from './logicBored';
import { BannerAd } from 'react-native-google-mobile-ads';
import { Icon, BoredButton, ShareButton } from './buttons';

const sizeHint = new Sizehint();
const screenView = new ScreenView();
const dataManagment = new BoredSearchDataManagment();
const favoriteLogic = new FavoriteLogic();
const EmergencySize = new EmergencyTool()

const LoadingPopUp = ({modalVisible}) => {
    return (
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
            <View style={[styleSheet.centerAlign, {flex: 1, backgroundColor: "rgba(0, 0, 0, 0.60)"}]}>
                <ActivityIndicator size='large' color={BoredSearchColors.BoredThemeNoOpacity}/>
            </View>
        </Modal>
    )
}

const CodeVerification = ({email, setCode, resend}) => {
    const codeRef = useRef([]);
    const makeFocus = useRef()
    
    useEffect(()=>{
        const keyListen = Keyboard.addListener(
            'keyboardDidHide',
            ()=>{makeFocus.current.blur()}
        )
        return ()=>{
            keyListen.remove()
        }
    },[])
  
  
    function checkFocused(){
        if (!makeFocus.current.isFocused()){
            makeFocus.current.focus()
        }
        else {
            makeFocus.current.blur()
        }
    }
  
  
    function settingCode(text) {
      codeRef.current = text.split('')
      setCode(text)
    }
  
    return (
        <View style={{height: '100%' ,alignItems: 'center', width: '100%'}}>
            <View style={[styleSheet.centerAlign, {height: '15%', width: '100%'}]}>
                <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
                    {`A 4 digit verification code has been sent to ${email}`}
                </Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',width: '100%', height:'30%'}}>
                <TouchableOpacity style={styleSheet.inputBoxes} activeOpacity={1} onPress={()=>checkFocused()}>
                    <Text style={styleSheet.fonts}>{codeRef.current[0] ? codeRef.current[0] : ''}</Text>
                </TouchableOpacity>
                <View style={styleSheet.inputBoxes}>
                    <Text style={styleSheet.fonts}>{codeRef.current[1] ? codeRef.current[1] : ''}</Text>
                </View>
                <View style={styleSheet.inputBoxes}>
                    <Text style={styleSheet.fonts}>{codeRef.current[2] ? codeRef.current[2] : ''}</Text>
                </View>
                <View style={styleSheet.inputBoxes}>
                    <Text style={styleSheet.fonts}>{codeRef.current[3] ? codeRef.current[3] : ''}</Text>
                </View>
            </View>
            <View style={[styleSheet.centerAlign, {width: '100%', height: 50}]}>
                <BoredButton fill text='Resend' onPress={()=>resend()}/>
            </View>
            <TextInput ref={makeFocus} 
                style={{opacity: 0.016, borderBottomColor: 'red', borderBottomWidth: 1, width: '90%', position:'absolute', bottom: 0}} 
                autoFocus={true} keyboardType="numeric" maxLength={4} 
                onChangeText={text=>settingCode(text)}
            />
        </View>
    )
  }


const PageChange = ({page, loading ,onPress}) => {

    function changePage(direction){
        if (page=='end' && direction=='next'){
            //pass
        }
        else if (page==0 && direction=='back'){
            //pass
        } 
        else{
            onPress(direction)
        }
    }

    return (
        <View style={{height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: loading ? 'center' : 'space-between', width:'100%'}}>
            {loading ? 
                <View>
                    <ActivityIndicator color={BoredSearchColors.BoredThemeNoOpacity} size='small' />
                </View>
                :
                <>
                    <View style={[styleSheet.centerAlign, {width: 60}]}>
                        { page != 0 ? 
                            <>
                                <Icon name='arrow-left-thin' size={50} color='grey' onPress={()=>changePage('back')} />
                            </> 
                        : null
                        }
                    </View>
                    <View style={[styleSheet.centerAlign, {width: 60}]}>
                        {page != 'end' ? 
                            <>
                                <Icon name='arrow-right-thin' size={50} color='grey' onPress={()=>changePage('next')} /> 
                            </> 
                        : null
                        }
                    </View> 
                </>
            }
        </View>
    )
}


//displays diffrent media types within main card
const CardMediaWindow = props => {
    const { colors } = useTheme();
    let newAspect = props.aspectRatio

    if (props.aspectRatio==0){
        newAspect = EmergencySize.EmergencyAspect()
    }

    if (props.search_type=='image') {
        return (
            <View style={{ 
                height: Math.round(props.size.imageBoxHeight*newAspect), 
                width: Math.round(props.size.imageBoxWidth), 
                borderWidth: 2, 
                borderColor: colors.text, 
                borderRadius: 11 }}
            >
                <Image
                    style={{ height: '100%', width: '100%', borderRadius: 9 }}
                    source={{ uri: props.thumbnail }}
                />
            </View>
        )
    }
    else if (props.search_type=='video') {
        return (
            <View style={{ 
                height: Math.round(props.size.videoThumbnailHeight*props.aspectRatio), 
                width: Math.round(props.size.videoThumbnailWidth), 
                borderWidth: 2, 
                borderColor: colors.text, 
                borderRadius: 11 }}
            >
                <Image
                    style={{ width: '100%', height: '100%', borderRadius: 9 }}
                    source={{ uri: props.thumbnail }}
                />
            </View>
        )
    }
    else if (props.search_type=='audio') {
        return (
            <View style={{ width: 300, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ 
                    height: (props.size.webThumbnailHeight), 
                    width: props.size.webThumbnailWidth, 
                    borderWidth: 2, 
                    borderColor: colors.text, 
                    borderRadius: 11 }}
                >
                    <Image
                        style={{ width: '100%', height: '100%' }}
                        source={{ uri: props.thumbnail }}
                    />
                </View>
                <View style={{ backgroundColor: 'black', position: 'absolute', borderRadius: 40}}>
                    <Icon name='volume-high' size={50} color={colors.text}/>
                </View>
            </View>
        )
    }
    else if (props.search_type=='web' && props.thumbnail && props.aspectRatio ) {
        return (
            <View style={{ 
                height: Math.round(props.size.webThumbnailHeight*props.aspectRatio), 
                width: Math.round(props.size.webThumbnailWidth), 
                borderWidth: 2, 
                borderColor: colors.text, 
                borderRadius: 11 }}
            >
                <Image
                    style={{ width: '100%', height: '100%', borderRadius: 9 }}
                    source={{ uri: props.thumbnail }}
                />
            </View>
        )
    }
    else {
        return (
            null
        )
    }
};

//cusom view able to resize when screen size is changed
const AdaptiveView = props => {
    const [viewData, setViewdata] = useState({});
    const [dimension, setDimension] = useState({w: props.viewWidth, h: props.viewHeight});

    useEffect(()=>{
        if (props.style) {
            if (props.viewHeight && props.viewWidth){
                setViewdata({
                    ...props.style,
                    width: typeof props.viewWidth=='number' ? sizeHint.X(props.viewWidth) : props.viewWidth,
                    height: typeof props.viewHeight=='number' ? sizeHint.Y(props.viewHeight) : props.viewHeight
                })
            }
            else if (props.viewHeight && !props.viewWidth){
                setViewdata({
                    ...props.style,
                    height: typeof props.viewHeight=='number' ? sizeHint.Y(props.viewHeight) : props.viewHeight
                })
            }
            else if (!props.viewHeight && props.viewWidth){
                setViewdata({
                    ...props.style,
                    width: typeof props.viewWidth=='number' ? sizeHint.X(props.viewWidth) : props.viewWidth
                })
            }
            else {
                const columns = screenView.columnCheck()
                if (columns>1){
                    const newWidth = sizeHint.X(1)/columns
                    setViewdata({
                        ...props.style,
                        width: newWidth
                    })    
                }
                else {
                    setViewdata({
                        ...props.style,
                        width: sizeHint.X(1)
                    })
                }
            }
        }
        else {
            if (props.viewHeight && props.viewWidth){
                setViewdata({width: typeof props.viewWidth=='number' ? sizeHint.X(props.viewWidth) : props.viewWidth, height: typeof props.viewHeight=='number' ? sizeHint.Y(props.viewHeight) : props.viewHeight})
            }
            else if (props.viewHeight && !props.viewWidth){
                setViewdata({height: typeof props.viewHeight=='number' ? sizeHint.Y(props.viewHeight) : props.viewHeight})
            }
            else if (!props.viewHeight && props.viewWidth){
                setViewdata({width: typeof props.viewWidth=='number' ? sizeHint.X(props.viewWidth) : props.viewWidth})
            }
            else {
                const columns = screenView.columnCheck()
                if (columns>1){
                    setViewdata({
                        ...props.style,
                        width: sizeHint.X(1)/columns
                    })    
                }
                else {
                    setViewdata({
                        ...props.style,
                        width: sizeHint.X(1)
                    })
                }
            }
        }
    },[])
  
    useEffect(()=>{
        let listen = Dimensions.addEventListener('change', status =>{
            var currentData = {}
            const curHeight = dimension.h
            const curWidth = dimension.w
            //some components send width or height as a percentage
            //view checks if its a string (%) or number to determine the size
            if (props.viewWidth) {
                if (typeof props.viewWidth=='number') {
                    const newWidth = status.window.width*props.viewWidth
                    currentData.width = Math.round(newWidth)
                }
                else if (typeof props.viewWidth=='string'){
                    currentData.width = props.viewWidth
                }
            }
            else {
                const columns = screenView.columnReCheck(status.window.width)
                currentData.width = status.window.width/columns
            }
            
            if (props.viewHeight) {
                if (typeof props.viewHeight=='number') {
                    const newHeight = status.window.height*props.viewHeight
                    currentData.height = Math.round(newHeight)
                }
                else if (typeof props.viewWidth=='string'){
                    currentData.height = props.viewHeight
                }
            }

            if (props.style){
                if (props.viewHeight && props.viewWidth){
                    var viewStyle = {
                        ...props.style,
                        width: currentData.width,
                        height: currentData.height
                    }
                    setViewdata(viewStyle)
                }
                else if (props.viewHeight){
                    var viewStyle = {
                        ...props.style,
                        height: currentData.height
                    }
                    setViewdata(viewStyle)
                }
                else if (props.viewWidth){
                    var viewStyle = {
                        ...props.style,
                        width: currentData.width,
                    }
                    setViewdata(viewStyle)
                }
                else {
                    if (currentData.width && currentData.height){
                        var viewStyle = {
                            ...props.style,
                            width: currentData.width,
                            height: currentData.height
                        }
                        setViewdata(viewStyle)
                    }
                    else if (!currentData.width && currentData.height){
                        var viewStyle = {
                            ...props.style,
                            height: currentData.height
                        }
                        setViewdata(viewStyle)
                    }
                    else if (currentData.width && !currentData.height) {
                        var viewStyle = {
                            ...props.style,
                            width: currentData.width,
                        }
                        setViewdata(viewStyle)
                    }
                    else{
                    }
                }
            }
            else {
                var viewStyle = {}
                if (curHeight && curWidth){
                    viewStyle = {
                        width: currentData.width,
                        height: currentData.height
                    }
                }
                else if (curHeight){
                    viewStyle = {
                        ...props.style,
                        height: currentData.height
                    }
                }
                else if (curWidth){
                    viewStyle = {
                        ...props.style,
                        width: currentData.width,
                    }
                }
                else {
                    viewStyle = {
                        ...props.style,
                        width: currentData.width,
                    }
                }
                setViewdata(viewStyle)
            }
        })
        return () => {
            listen.remove()
        }
    }, [])
  
    return (
      <View style={viewData}>
        {props.children}
      </View>
    )
}

//main card or view of the app
const BoringCard = props => {
    const { colors } = useTheme();
    const width = props.columns>1 ? (props.displayWidth*.98)/props.columns : props.displayWidth;
    const cardSize = {
        imageBoxHeight: props.columns>1 ? sizeHint.Y(.57) : sizeHint.Y(.57), 
        imageBoxWidth: props.columns>1 ? sizeHint.X(.95)/props.columns : sizeHint.X(.97), 
        webThumbnailHeight: props.columns>1 ? sizeHint.Y(.47) : sizeHint.Y(.47), 
        webThumbnailWidth: props.columns>1 ? sizeHint.X(.95)/props.columns : sizeHint.X(.97),
        videoThumbnailHeight: props.columns>1 ? sizeHint.Y(.47) : sizeHint.Y(.47),
        videoThumbnailWidth: props.columns>1 ? sizeHint.X(.95)/props.columns : sizeHint.X(.97)
    }

    const outLineIt = props.columns>1 ? {borderBottomColor: 'rgba(201, 198, 200, 0.41)', borderWidth:3, marginBottom: 5} : {}

    const withTitles = ['web', 'video', 'image'];

    async function openLink() {
        const websetting = await dataManagment.pull('@weboptions')
        if (websetting.setting=='In App'){
            props.navigation.push({pathname: '../browser', params: {link: props.context.link}})
        }
        else {
            Linking.openURL(props.context.link)
        }
    };

    function showTitle() {
        if (!props.context.title || props.context.title=='') {
            return
        }
        else if (withTitles.includes(props.context.search_type)) {
            if (props.context.search_type=='image'){
                if (props.context.title){
                    if (props.context.title!=''){
                        return true
                    }
                    else{
                        return
                    }
                }
                else {
                    return 
                }
            }
            return true
        }
        
    };

    function quotedText() {
        if (props.context.search_type=='text' || props.context.search_type=='quote') {
            return true
        }
        else {
            return
        }
        
    };

    return(
        <View style={[{ alignItems: 'center', width: width, alignSelf: 'center', justifyContent:'center'}, outLineIt]}>
            <TouchableOpacity style={{ alignItems: 'center', width: '100%', borderRadius: 10, justifyContent:'space-between'}} onPress={()=>openLink()}>
                { 
                    showTitle() ? 
                        <AdaptiveView style={{ justifyContent: 'center', alignItems: 'center' }} viewHeight={.085} >
                            <BoredText text={props.context.title} textStyle={{fontWeight: 'bold'}} />
                        </AdaptiveView> 
                    : 
                        <View style={{ marginBottom:10 }}></View>
                }
                <CardMediaWindow aspectRatio={props.context.aspect_ratio} search_type={props.context.search_type} thumbnail={props.context.thumbnail} cardView={props.cardView} size={cardSize}/>
                {
                    props.context.search_type!='image' || props.context.snippet=='' ?
                        <>
                            {
                                quotedText() ?  
                                    <QuotedText text={props.context.snippet}/> 
                                : 
                                    <View style={{ justifyContent: 'center', alignItems: 'center', padding: '3%' }}>
                                        <BoredText text={props.context.snippet}/>
                                    </View> 
                            }
                        </>
                    : 
                    null
                }
            </TouchableOpacity>
            <View style={{ width:'100%', justifyContent: 'space-evenly', alignItems: 'center', padding: '3%' }}>
                <BoredText text={`Source: ${props.context.source}`}/>
                <BoredText text={`Posted By: ${props.context.posted_by}`}/>
            </View>
            <View style={{ width: '100%', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', width: '50%', alignItems: 'center', justifyContent: 'space-around', padding: '3%' }}>
                    <ShareButton message={props.context.link}/>
                    <Icon name='bookmark-outline' color={colors.text} size={25} onPress={()=>props.createFolder()} />
                </View>
            </View>
        </View>
    )
};


const FavoriteCard = props => {
    const { colors } = useTheme();
    const pressDelete = () => props.onLongPress();

    return (
        <TouchableOpacity style={{ 
            width: sizeHint.X(1), 
            justifyContent:'center', 
            padding: '3%', 
            borderWidth: 1, 
            borderColor: colors.text, 
            borderRadius: 10 
            }} 
            onPress={()=>props.navigation.push({pathname: 'browser', params: {link: props.link}})} 
            onLongPress={()=>pressDelete()}
        >
            {favoriteLogic.favoriteTitle(props.title) ? 
                <BoredText text={props.title} textStyle={{ padding: '1%', fontWeight:'bold', fontSize: 15 }} /> 
                : 
                null
            }
            <BoredText text={favoriteLogic.favoriteUrl(props.link)} textStyle={{ padding: '1%' }} />
        </TouchableOpacity>
    )
};



const FavoriteFolder = props => {
    const { colors } = useTheme();

    function handleLongPress() {
        if (props.deleteFolder){
            props.deleteFolder(props.foldername, props.foldername)
        }
    };

    return (
        <TouchableOpacity 
            style={{
                borderWidth: 2, 
                borderColor: BoredSearchColors.BoredThemeNoOpacity, 
                borderRadius: 10, 
                flexDirection:'row', 
                justifyContent: 'center', 
                alignItems:'center', 
                height: 55, 
                margin: 5, 
                width: sizeHint.X(.7) 
                }} 
                onPress={()=>props.navigation.push({pathname: 'favoritescreen', params: {title: props.foldername, folderId: props.foldername, colorText: colors.text, colorBackground: colors.background}})} 
                onLongPress={handleLongPress}
            >
            <View style={{ alignItems:'center', width:'95%', flexDirection: 'row', height: '100%', justifyContent: 'space-between'}}>
                <Icon name='folder' color={BoredSearchColors.BoredThemeNoOpacity} size={20}/>
                <View style={{ borderRadius: 40, justifyContent: 'center', alignItems: 'center' }}>
                    <BoredText text={props.foldername} textStyle={{alignSelf: 'center', fontWeight: 'bold'}} />
                </View>
                <View style={{ borderRadius: 40, justifyContent: 'center', alignItems: 'center' }}>
                    <BoredText text={props.favoredAmount} textStyle={{alignSelf: 'center'}} />
                </View>
            </View>
        </TouchableOpacity>
    )
};

const Search = props => {
    const { colors } = useTheme();
    const [search, setSearch] = useState('');


    async function searchQuery() {
        if (props.openType) {
            props.openType(search)
        }
    };

    return (
        <View style={styleSheet.searchView}>
            <TextInput 
                placeholder='Search' 
                value={search}
                onChangeText={text=>setSearch(text)}
                placeholderTextColor={colors.text} 
                maxLength={20}
                style={{ color: colors.text, width: '80%', borderRadius: 200, height:'100%', paddingLeft:5}} 
            />
            <View style={{ justifyContent: 'center', alignItems: 'flex-end', borderRadius:50, height:'100%', width: '20%' }}>
                <Icon name='magnify' color={BoredSearchColors.BoredThemeNoOpacity} size={30} onPress={()=>searchQuery()} style={{marginRight:'2%'}}/>
            </View>
        </View>
    )
};


const NewTopicsFeed = props => {

    function handlePress(value) {
        if (props.onPress) {
            props.onPress(value)
        }
    };

    return (
        <FlatList
            data={props.list}
            keyExtractor={(item) => item.topic.toString()}
            numColumns={2}
            style={{ width: '100%' }}
            renderItem={({ item }) => (
                <TopicPill topic={item.topic} addIt={props.chosenList.includes(item.topic) ? true : false} onPress={()=>handlePress(item.topic)} />
            )}
        />
    )
};


const AdView = props => {
    const [adInterests, setAdinterests] = useState([]);
    const adUnitId = "Google AdMob unit ID"
    const bannerWidth = props.columns>1 ? Math.round(sizeHint.X(.98)/props.columns) : Math.round(sizeHint.X(1))
    const bannerHeight = props.columns>1 ? Math.round(props.displayHeight*.52) : Math.round(props.displayHeight*.515)
    const cardSize = {
        containerHeight: props.columns>1 ? props.displayHeight*.55 : props.displayHeight*.518, 
        containerWidth: props.columns>1 ? Math.round(sizeHint.X(.98)/props.columns) : sizeHint.X(1),
    }
    const bannerSize = `${bannerWidth}x${bannerHeight}`

    const adStyle = props.columns>1 ? {width: cardSize.containerWidth, marginBottom: '2%', borderWidth:3, borderBottomColor: 'rgba(201, 198, 200, 0.41)', height: cardSize.containerHeight} : {width: cardSize.containerWidth, height: cardSize.containerHeight}

    useEffect(()=>{
        async function adsCheck(){
            const adsResult = await dataManagment.pull('@personalAds')
            if (adsResult.personalized){
                var interestsValue = await dataManagment.savePullInterests('pull')
                if (interestsValue) {
                    if (interestsValue == ''){
                        setAdinterests([])
                    }
                    else {
                        if (interestsValue.includes("")) {
                            //travel used just as default to generate ads if empty
                            interestsValue = ['travel']
                        }
                        setAdinterests(interestsValue)
                    }
                }
            }
            else {
                setAdinterests(['travel'])
            }
        }
        adsCheck()
    },[])


    const itFailed = (error) => {
        // console.log(`${error} with Unit ID: ${adUnitId}`)
    };

    const itLoaded = (loaded) => {
        // console.log('Loaded with keywords:', adInterests)
    }


    if (Platform.OS=='android'){
        const androidADId = 'Android AD ID'
    }
    else {
        //ios app Id 
    };

    return (
        <View style={[styleSheet.adContainer, adStyle]}>
            <BannerAd
                unitId={adUnitId}
                size={bannerSize}
                onAdFailedToLoad={e=>itFailed(e)}
                onAdLoaded={l=>itLoaded(l)}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                    keywords: adInterests 
                }}
            />
        </View>
    )
};


const styleSheet = StyleSheet.create({
    centerAlign: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    adContainer: {
        borderWidth: 1,
        justifyContent:'center',
        alignItems:'center',
    },
    containerBody: {
        borderRadius: 10, 
        justifyContent:'center',
        alignItems:'center'
    },
    inputBoxes: {
        borderWidth: 1, 
        borderColor: BoredSearchColors.BoredThemeNoOpacity, 
        width: 50, 
        height: 80, 
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    fonts: {
        fontWeight: 'bold',
        fontSize: 30
    },
    searchView: { 
        backgroundColor: 'rgba(143, 142, 142, 0.9)', 
        borderWidth: 1, 
        borderColor: BoredSearchColors.BoredThemeNoOpacity, 
        width: '95%', 
        height: 42 , 
        borderRadius: 40, 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexDirection:'row' 
    }
})

export { 
    AdView,
    AdaptiveView,
    FavoriteFolder, 
    FavoriteCard,
    Search, 
    NewTopicsFeed, 
    BoringCard,
    PageChange,
    CodeVerification,
    LoadingPopUp
}