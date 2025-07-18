import { Dimensions } from "react-native";
import * as DeviceInfo from 'expo-device';


class Sizehint {

    getCurrentWindow = () => {
        const w = Dimensions.get('window').width
        const h = Dimensions.get('window').height
        return {w: w, h: h}
    }

    X = (percentage) => {
        var converted
        const w = this.getCurrentWindow().w
        converted = w * percentage
        if (w > 430){
            if (percentage>.5){
                //pass
            }
            else {
                converted = w * (percentage-.03)
            }
        }
        else {
            converted = w * percentage
        }
        return Math.round(converted)
    };

    Y = (percentage) => {
        var converted
        const h = this.getCurrentWindow().h
        converted = h * percentage
        return Math.round(converted)
    };


    NewX = (customWidth, percentage) => {
        var converted = customWidth * percentage
        if (customWidth > 430) {
            if (percentage > .5) {
                //pass
            }
            else {
                converted = customWidth * (percentage - .03)
            }
        }
        return Math.round(converted)
    };

    NewY = (customHeight, percentage) => {
        var converted = customHeight * percentage
        return Math.round(converted)
    };
};


class ScreenView {

    getScreenDimension = (dimension) => {
        const { width, height } = Dimensions.get('window')
        if (dimension=='width'){
            return width
        }
        else if (dimension=='height'){
            return height
        }
        else {
            return {w: width, h: height}
        }
    };

    columnCheck = () => {
        if (DeviceInfo.DeviceType[DeviceInfo.deviceType]=='TABLET') {
            const checkwidth = Dimensions.get('window').width;
            const columnAmounts = [1,2,3,4]
            for (let column in columnAmounts){
                var columnWidth = checkwidth/columnAmounts[column]
                if (columnWidth > 420) {
                    //pass
                }
                else {
                    return columnAmounts[column]
                }
            }
        }
        else {
            return 1
        }
    };

    columnReCheck = (newWidth) => {
        const columnAmounts = [1,2,3,4]
        for (let column in columnAmounts){
            const recolumnWidth = newWidth/columnAmounts[column]
            if (recolumnWidth > 420) {
                //pass
            }
            else {
                return columnAmounts[column]
            }
        }
    };

    orientationCheck = () => {
        const display = DeviceInfo.DeviceType[DeviceInfo.deviceType];
        if (display=='PHONE'){
            return 'portrait'
        }
        else if (display=='TABLET'){
            return 'landscape'
        }
    };

    getScreenType = () => {
        return DeviceInfo.DeviceType[DeviceInfo.deviceType];
    };

    getResizedWidth = (newSize, desiredHint) => {
        var converted = newSize * desiredHint
        if (newSize>430) {
            if (desiredHint > .5) {
                //pass
            }
            else {
                converted = newSize * (desiredHint - .03)
            }
        }
        return Math.round(converted)
    };

    getResizedHeight = (newSize, desiredHint) => {
        var converted = newSize * desiredHint
        return Math.round(converted)
    };
};

class EmergencyTool {

    EmergencyAspect = () => {
        return 0.5828125
    }
}

export {Sizehint, EmergencyTool, ScreenView};