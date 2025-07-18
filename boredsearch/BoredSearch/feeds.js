import React, { useState, useEffect, useRef } from "react";
import { FlatList, View, Dimensions } from "react-native";
import { AdView, BoringCard } from "./layouts";
import { EmailVerificationButton } from "./buttons";
import { ScreenView } from "./dimensions";
import { BoredText } from "./texts";
import MasonryList from '@react-native-seoul/masonry-list';

const screenView = new ScreenView();

const DeviceFeed = props => {
    const [columnAmount, setColumnamount] = useState();
    const displayWidth = useRef();
    const displayHeight = useRef();
    const flatListRef = useRef()

    const createFolder = (title, link, id) => props.createFolder(title, link, id)

    useEffect(()=>{
        const listen = Dimensions.addEventListener('change', status => {
            const columnCount = screenView.columnReCheck(parseInt(status.window.width))
            if (status.window.width<displayWidth.current){
                displayWidth.current = parseInt(status.window.width)
                displayHeight.current = parseInt(status.window.height)
                setColumnamount(1)
            }
            else {
                displayWidth.current = parseInt(status.window.width)
                displayHeight.current = parseInt(status.window.height)
                setColumnamount(columnCount)
            }
        })
        return () => {
            listen.remove()
        }
    }, [columnAmount]);

    useEffect(() => {
        const { w, h } = screenView.getScreenDimension();
        displayWidth.current = w
        displayHeight.current = h
        setColumnamount(screenView.columnReCheck(displayWidth.current))
    }, []);

    useEffect(() => {
        if (flatListRef.current){
            flatListRef.current.scrollToIndex({animated: false, index: 0});
        }
    }, [props.feed]);


    if (props.feed.length==1 && props.feed[0].id=='empty'){
        return (
            <View style={{width:'100%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <BoredText text={props.feed[0].BoredMessage} textStyle={{textAlign: 'center', fontWeight: 'bold', fontSize: 20}}/>
            </View>
        )
    }
    else {
        if (columnAmount>1) {
            return (
                <MasonryList
                    key={columnAmount.toString()}
                    data={props.feed}
                    keyExtractor={(item)=>item.id.toString()}
                    numColumns={columnAmount}
                    style={{ width: '100%' }}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 10 }} />
                    )}
                    renderItem={({ item }) => {
                        if (item.id=='inactive') {
                            return (
                                <EmailVerificationButton />
                            )
                        }
                        else if (item.id=='empty') {
                            return null
                        }
                        else {
                            if (item.search_type=='AD') {
                                //displays ads via google admob
                                return (
                                    <AdView 
                                        cardView='Tablet' 
                                        displayWidth={displayWidth.current} 
                                        displayHeight={displayHeight.current} 
                                        columns={columnAmount}
                                    />
                                )
                            }
                            else {
                                return (
                                    <BoringCard 
                                        context={item}
                                        cardView='Tablet'
                                        displayWidth={displayWidth.current}
                                        displayHeight={displayHeight.current}
                                        navigation={props.navigation}
                                        columns={columnAmount}
                                        createFolder={()=>createFolder(item.title, item.link, item.id)}
                                    />
                                )
                            }
                        }}
                    }
                />
            )
        }
        else if (columnAmount==1) {
            return (
                <FlatList
                    key={'Handset'}
                    data={props.feed}
                    keyExtractor={(item)=>item.id.toString()}
                    style={{ width: '100%' }}
                    contentContainerStyle={{ alignItems:'center' }}
                    ref={flatListRef}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 5 }} />
                    )}
                    renderItem={({ item }) => {
                        if (item.id=='inactive') {
                            return (
                                <EmailVerificationButton />
                            )
                        }
                        else if (item.id=='empty') {
                            return null
                        }
                        else {
                            if (item.search_type=='AD') {
                                //displays ads via google admob
                                return (
                                    <AdView 
                                        cardView='Handset' 
                                        displayWidth={displayWidth.current} 
                                        displayHeight={displayHeight.current} 
                                        columns={1}
                                    />
                                )
                            }
                            else {
                                return (
                                    <BoringCard 
                                        context={item}
                                        cardView='Handset'
                                        columns={1}
                                        displayWidth={displayWidth.current}
                                        displayHeight={displayHeight.current}
                                        navigation={props.navigation}
                                        createFolder={()=>createFolder(item.title, item.link, item.id)}
                                    />
                                )
                            }
                        }}
                    }
                />
            )
        }
        else {
            return null
        }
    }
};

export {
    DeviceFeed
}