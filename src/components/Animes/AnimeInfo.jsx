import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, Image, TouchableOpacity, ScrollView, Share, Alert, StatusBar } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { MotiView } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import GenresAndEpisodes from './GenresAndEpisodes';
import ActivityLoader from '../ActivityLoader';
import FavoritesButton from '../FavoritesButton';
import Animated, { FadeInDown, FadeInUp, FadeOutUp } from 'react-native-reanimated';
import Config from "../constants/env.config";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnimeInfo = ({ route, navigation }) => {
  // Extracting 'id' from the 'route.params' or using an empty object if not available
  const { id } = route.params ?? {};

  // State variables to store anime data
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [desc, setDesc] = useState('');
  const [name, setName] = useState('');
  const [genres, setGenres] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [animeUrl, setAnimeUrl] = useState('');
  const [showDescription, setShowDescription] = useState(false); // State to control the animation
  const [isLoading, setIsLoading] = useState(true);
  const [showZoomedImage, setShowZoomedImage] = useState(false);
  const [descriptionHeight, setDescriptionHeight] = useState(0);

  // API URL to fetch anime data
  const url = `${Config.API_BASE_URL}/anime/gogoanime/info/${id}`;
  const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);
  // Function to fetch data from the API
  const fetchData = async () => {
    try {
      const { data } = await axios.get(url, {
        headers: { 'x-api-key': Config.API_KEY }
      });

      // Set anime data to state variables
      setImage(data.image);
      setTitle(data.title);
      setStatus(data.status);
      setDesc(data.description);
      setName(data.otherName);
      setAnimeUrl(data.url);
      setGenres(data.genres);
      setEpisodes(data.episodes);
      setIsLoading(false);
      return data;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Function to handle the icon click
  const handleIconClick = () => {
    // Toggle the description display state on icon click
    setShowDescription(!showDescription);
  };

  // Fetch data on component mount
  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // Sharing
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this anime: ${title}\n\n${animeUrl}`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <>
      <View style={tw`flex-1 bg-black`}>
        {isLoading ?
          <ActivityLoader />
          :

          <>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Animated.View entering={FadeInUp.delay(200)}>
                {/* Top Image Section */}
                <AnimatedImageBackground sharedTransitionTag="sharedTag" source={{ uri: image }} style={tw`h-96`}>
                  {/* Image Overlay */}
                  <LinearGradient colors={['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.9)']} style={{ height: '100%', width: '100%' }}>
                    {/* Header with Back Button and Share Button */}
                    <View style={tw`flex-row justify-between m-6`}>
                      <Ionicons name="arrow-back-circle-sharp" size={40} color="white" onPress={() => { navigation.goBack() }} />
                      <Ionicons name="share-social-outline" size={35} color="white" onPress={onShare} />
                    </View>
                    {/* Anime Details */}
                    <View style={tw`flex flex-row mx-2`}>
                      {/* Anime Image */}
                      <TouchableOpacity onPress={() => setShowZoomedImage(true)}>
                        <Image source={{ uri: image }} style={tw`w-32 h-44 rounded-md`} />
                      </TouchableOpacity>
                      <View style={tw`px-4 flex-1`}>
                        {/* Anime Title */}
                        <Text style={tw`text-white text-xl`} selectable={true}>{title}</Text>
                        {/* Status (Ongoing or Completed) */}
                        <View style={tw`flex-row items-center`}>
                          <View style={tw`items-center mr-auto`}>
                            {status === 'Ongoing' ? (
                              <Feather name="clock" size={18} color="#D3D3D3" />
                            ) : (
                              <Ionicons name="checkmark-done" size={18} color="#D3D3D3" />
                            )}
                            <Text style={tw`text-[#D3D3D3] text-xs px-2`}>{status}</Text>
                          </View>
                          <FavoritesButton type="anime" id={id} title={title} image={image} />
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </AnimatedImageBackground>
                {/* Anime Description and Other Names */}
                <View style={tw`relative`}>
                  <View style={tw`mt-4`}>
                    <View onLayout={(event) => setDescriptionHeight(event.nativeEvent.layout.height)}>
                      <Text style={[tw`text-[#D3D3D3] px-2 leading-5 text-justify`]}>Description: {desc}</Text>
                      <Text style={[tw`text-[#D3D3D3] px-2 leading-5 text-justify`]}>Other name(s): {name}</Text>
                    </View>
                  </View>
                  <View style={tw`h-full`}>
                    {/* Animated description view */}
                    <MotiView
                      from={{
                        translateY: -descriptionHeight,
                      }}
                      animate={{
                        translateY: showDescription ? 0 : -descriptionHeight,
                      }}
                      transition={{
                        type: 'timing',
                        duration: 500,
                      }}
                      style={{ overflow: 'hidden', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}
                    >
                      <LinearGradient 
                      locations={[0,0.05,0.1]}
                      colors={['rgba(0, 0, 0, 0.5)','rgba(0, 0, 0, 0.7)' ,'rgba(0, 0, 0, 1)']} 
                      start={{x: 0.0, y: 0.0}} end={{x: 0.0, y: 0.1}}
                      style={{ height: '100%', width: '100%' }}>
                        <TouchableOpacity onPress={handleIconClick}>
                          {/* Animated icon rotation */}
                          <MotiView
                            from={{
                              rotate: '180deg',
                            }}
                            animate={{
                              rotate: showDescription ? '180deg' : '0deg',
                            }}
                            transition={{
                              type: 'timing',
                              duration: 500,
                            }}
                          >
                            <AntDesign name="down" size={24} color="white" style={tw`text-center pt-3`} />
                          </MotiView>
                        </TouchableOpacity>
                        {/* Render Genres and Episodes which is a flatlist */}
                        <GenresAndEpisodes genres={genres} episodes={episodes} title={title} image={image} />
                      </LinearGradient>
                    </MotiView>
                  </View>
                </View>
              </Animated.View>
            </ScrollView>
            {showZoomedImage &&
              <TouchableOpacity
                style={tw`bg-black bg-opacity-75 items-center justify-center absolute flex-1 h-full w-full`}
                onPress={() => setShowZoomedImage(false)}
              >
                <View>
                  <Animated.Image entering={FadeInDown} exiting={FadeOutUp} source={{ uri: image }} style={tw`w-150 h-150 rounded-md`} resizeMode='contain' />
                </View>
              </TouchableOpacity>}
          </>
        }
      </View>
    </>
  );
};

export default AnimeInfo;
