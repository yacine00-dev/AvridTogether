import { TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../app/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const CentralButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('PostScreen')}
      style={{
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#052659',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <MaterialIcons name="add" size={36} color="white" />
      </View>
    </TouchableOpacity>
  );
};