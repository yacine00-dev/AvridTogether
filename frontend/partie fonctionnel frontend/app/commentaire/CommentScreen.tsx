import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Star } from 'lucide-react-native';

interface Profile {
  avatar: string;
  firstName: string;
  profileUrl: string;
}

interface Comment {
  profile: Profile;
  comment: string;
  rating: number;
}

const CommentScreen: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchComments = async () => {
    try {
      const response = await axios.get('http://<ton-ip-ou-domaine>:<port>/api/comments'); // Remplace par ton URL 
      setComments(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const renderStars = (count: number) => (
    <View style={{ flexDirection: 'row' }}>
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={16}
          color={index < count ? '#FFD700' : '#ccc'}
          fill={index < count ? '#FFD700' : 'none'}
        />
      ))}
    </View>
  );

  const openProfile = (url: string) => {
    Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentCard}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: item.profile.avatar }} style={styles.avatar} />
        <TouchableOpacity onPress={() => openProfile(item.profile.profileUrl)}>
          <Text style={styles.clientName}>{item.profile.firstName}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
      {renderStars(item.rating)}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments and Ratings </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default CommentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    alignSelf: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  commentCard: {
    backgroundColor: '#f1f1f1',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  clientName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  commentText: {
    marginBottom: 8,
    fontStyle: 'italic',
  },
});

