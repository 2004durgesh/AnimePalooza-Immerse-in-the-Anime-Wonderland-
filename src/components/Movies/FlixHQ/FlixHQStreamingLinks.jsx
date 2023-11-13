import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ToastAndroid,
} from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import Config from "../../constants/env.config";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Overlay, ListItem,CheckBox } from '@rneui/themed';
import VideoPlayer from '../../VideoPlayer';

const serverOptions = ["mixdrop", "vidcloud", "upcloud"];

const FlixHQStreamingLinks = ({ route, navigation }) => {
    const webviewRef = useRef(null);
    const [streamingSource, setStreamingSource] = useState('');
    const [streamingLinks, setStreamingLinks] = useState([]);
    const [streamingQuality, setStreamingQuality] = useState('');
    const [selectedServer, setSelectedServer] = useState("");
    const [savedPosition, setSavedPosition] = useState(0);
    const isFocused = useIsFocused();
    const { episodeId, mediaId, episodeTitle } = route.params;
    const [visible, setVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [selectedIndex, setSeletedIndex] = useState(0);

    // Function to toggle the overlay
    const toggleOverlay = () => {
        setVisible(!visible);
    };

    // Fetch streaming links on component mount
    useEffect(() => {
        // API URL to fetch streaming links for the episode
        const url = `${Config.API_BASE_URL}/movies/flixhq/watch?episodeId=${episodeId}&mediaId=${mediaId}$server=${selectedServer || "vidcloud"}`;


        // Function to fetch streaming links from the API
        const fetchData = async () => {
            try {
                const { data } = await axios.get(url,{
                    headers:{'x-api-key': Config.API_KEY}
                });
                setStreamingLinks(data.sources);
                const initialQuality = data.sources[0].quality; // Access quality from data
                setStreamingQuality(initialQuality); // Set the initial quality
                setStreamingSource(data.sources[0].url); // Set the initial source
                console.log(data)
                return data;
            } catch (err) {
                throw new Error(err.message);
            }
        };
        fetchData();
        console.log(url)
    }, [episodeId, mediaId, selectedServer]);
    return (
        <SafeAreaView style={tw`bg-black flex-1`}>
            <View style={tw`bg-black flex-1`}>
                {/* Header with Back Button */}
                <View style={tw`flex-row items-center justify-between px-5 my-5`}>
                    <Ionicons name="arrow-back-circle-sharp" size={40} color="white" style={tw`m-6`} onPress={() => { navigation.goBack() }} />
                    <View style={tw`flex-row gap-4`}>
                        <Octicons name="gear" size={35} color="white" onPress={toggleOverlay} />
                    </View>
                </View>
                {/* Overlay for quality selection */}
                <Overlay
                    isVisible={visible}
                    onBackdropPress={toggleOverlay}
                    style={tw`justify-center items-center`}
                >
                    <View style={tw`p-2 w-84`}>
                        <View>
                            {streamingLinks.map((source, index) => (
                                <View key={index}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setStreamingSource(source.url);
                                            setStreamingQuality(source.quality);
                                            setSeletedIndex(index);
                                        }}
                                        style={tw`p-2 flex-row justify-between items-center`}
                                    >
                                        {source.quality === "auto" ? <Text style={tw`text-[#DB202C]`}>Quality: {source.quality}</Text> : <Text style={tw`text-[#DB202C]`}>Quality: {source.quality}p</Text>}
                                        <CheckBox
                                            checked={selectedIndex === index}
                                            checkedIcon="dot-circle-o"
                                            uncheckedIcon="circle-o"
                                            center={true}
                                            containerStyle={tw`-p-1`}
                                            checkedColor="#DB202C"
                                            onPress={() => {
                                                setStreamingSource(source.url);
                                                setStreamingQuality(source.quality);
                                                setSeletedIndex(index);
                                            }} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <ListItem.Accordion
                            content={
                                <ListItem.Content>
                                    <ListItem.Title style={tw`text-[#DB202C]`}>Select a server</ListItem.Title>
                                </ListItem.Content>
                            }
                            isExpanded={expanded}
                            onPress={() => {
                                setExpanded(!expanded);
                            }}
                        >
                            <View style={tw`flex flex-row flex-wrap gap-1`}>
                                {serverOptions.map((server) => (
                                    <View key={server}>
                                        <TouchableOpacity style={[tw`p-2 rounded-full`, { borderWidth: 1, borderColor: 'red', }]} onPress={() => setSelectedServer(server)}>
                                            <ListItem.Title style={tw`text-red-500 capitalize`}>{server}</ListItem.Title>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </ListItem.Accordion>
                        <TouchableOpacity
                            style={tw`bg-[#DB202C] py-2 px-4 mt-4 rounded-md`}
                            onPress={toggleOverlay}
                        >
                            <Text style={tw`text-white text-center`}>Back</Text>
                        </TouchableOpacity>
                    </View>
                </Overlay>
                <VideoPlayer src={streamingSource} quality={streamingQuality} title={episodeTitle} provider='flixhq' />
            </View>
        </SafeAreaView>
    );
};

export default FlixHQStreamingLinks;
