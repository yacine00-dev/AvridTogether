import Swiper from 'react-native-swiper';
import React, { useRef, useState } from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    title: "Welcome to AvridTogether!",
    description: "Save money, meet new people, and travel smarter with carpooling.",
    image: require('../../assets/images/welcome.jpg'),
  },
  {
    title: "Safety & Trust",
    description: "Verified Drivers & Passengers, Ratings & Reviews for Every Ride Secure Payments &  Transparent Pricing .",
    image: require('../../assets/images/security.jpg'),
  },
];

const OnboardingScreen = () => {
  const swiperRef = useRef<Swiper | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigateToHome = () => {
    router.replace('/(tabs)/home');
  };

  const goToNextSlide = () => {
    if (swiperRef.current) {
      swiperRef.current.scrollBy(1);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Bouton Skip */}
      <TouchableOpacity 
        onPress={() => navigateToHome()} 
        style={{
          position: 'absolute', 
          top: 40, 
          right: 20, 
          zIndex: 10
        }}
      >
        <Text style={{ fontSize: 16, color: '#002366', fontWeight: 'bold' }}>Skip</Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        loop={false}
        activeDotColor="#002366"
        onIndexChanged={(index) => setCurrentIndex(index)}
      >
        {slides.map((item, index) => (
          <View 
            key={index} 
            style={{
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center', 
              paddingHorizontal: 20
            }}
          >
            <Image 
              source={item.image} 
              style={{ width: 250, height: 250, resizeMode: 'contain', marginBottom: 20 }} 
            />
            <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>{item.title}</Text>
            <Text style={{ fontSize: 16, textAlign: 'center', color: 'gray', marginTop: 10 }}>
              {item.description}
            </Text>
          </View>
        ))}
      </Swiper>

      {/* Bouton Continue */}
      <TouchableOpacity
        style={{
          backgroundColor: '#002366',
          padding: 15,
          width: '80%',
          borderRadius: 25,
          alignItems: 'center',
          alignSelf: 'center',
          marginBottom: 30,
        }}
        onPress={() => {
          if (currentIndex < slides.length - 1) {
            goToNextSlide();
          } else {
            navigateToHome();
          }
        }}
      >
        <Text style={{ color: '#fff', fontSize: 18 }}>
          {currentIndex === slides.length - 1 ? 'Commencer' : 'Continuer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;
