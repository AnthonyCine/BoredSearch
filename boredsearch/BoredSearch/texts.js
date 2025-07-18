import { View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Icon = ({name, size, color, style, onPress}) => {

    if (!style) {
        style = {}
    }

    function handlePress() {
        if (onPress) {
            onPress()
        }
    }

    return (
        <MaterialCommunityIcons name={name} size={size} color={color} style={style} onPress={handlePress} />
    )
}

const BoredText = ({text, textStyle, lines}) => {
    const { colors } = useTheme();
    var styling = {color: colors.text};

    if (textStyle) {
        styling = {
            ...styling,
            ...textStyle
        }
    };

    return (
        <Text style={styling} numberOfLines={lines ? lines : 0} ellipsizeMode='tail'>{text}</Text>
    )
};


//used for quotes from tumblr
const QuotedText = props => {
    const { colors } = useTheme();
    var textStyle = {color: colors.text, textAlign: 'center'};
    var quotesStyle = {color: colors.text, fontSize: 40}

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '98%' }}>
            <Text style={[quotesStyle, {alignSelf: 'flex-start'}]}>
                "
            </Text>
            <View style={{ width: '85%'}}>
                <Text style={textStyle}>
                    {props.text}
                </Text>
            </View>
            <Text style={[quotesStyle, {alignSelf: 'flex-end'}]}>
                "
            </Text>
        </View>
    )
};


const SelectionText = props => {

    function changeSelection() {
        if (props.selection==false) {
            props.onSelection(props.text)
        }
        else if (props.selection==true) {
            props.onUnselection(props.text)
        }
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '5%' }}>
            <BoredText text={props.text} textStyle={{color: props.theme}}/>
            <Icon name={props.selection==false ? 'checkbox-blank-outline' : 'check'} color={props.theme} size={25} onPress={()=>changeSelection()}/>
        </View>
    )
};


export { 
    BoredText, 
    SelectionText, 
    QuotedText
}