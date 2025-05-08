from django.contrib.auth.models import User # for users autentification 
from rest_framework import serializers # used to convert json data 
from users.models import profile , comments_rating
from posts.models import posts
from rest_framework_simplejwt.tokens import RefreshToken
from history.models import history
# users serialzers
class user_serializer (serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)  # Make password optional
    
    class Meta : 
        model = profile
        fields = ["id","email","username","phone_number","type_user","age","password","phone_number","ppermis_ic", "user_pic"]
        extra_kwargs = {"password": {"write_only": True, "required": False}}  # Make password optional in extra_kwargs too

    def create(self, validated_data):
        user = profile.objects.create_user(**validated_data)  
        return user

    def update(self, instance, validated_data):
        # Remove password from validated_data if it's not provided
        if 'password' in validated_data and not validated_data['password']:
            validated_data.pop('password')
        
        for attr, value in validated_data.items():
            if attr == 'password':
                instance.set_password(value)
            else:
                setattr(instance, attr, value)
        
        instance.save()
        return instance

    def to_representation(self, instance):
        
        refresh = RefreshToken.for_user(instance)

        return {
            "user": {
                "id": instance.id,
                "email": instance.email,
                "username": instance.username,
                "phone_number": str(instance.phone_number) if instance.phone_number else None,
                "type_user": instance.type_user,
                "age": instance.age,
                "ppermis_ic": instance.ppermis_ic.url if instance.ppermis_ic else None,
                "user_pic": instance.user_pic.url if instance.user_pic else None,
            },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }    

class userview_serializer (serializers.ModelSerializer):
    class Meta : 
        model = profile
        fields = ["id","email","username","phone_number","type_user","age","password","phone_number","ppermis_ic", "user_pic"]
        extra_kwargs = {"password": {"write_only": True}}


    def to_representation(self, instance):
        

        return {
            "user": {
                "id": instance.id,
                "email": instance.email,
                "username": instance.username,
                "phone_number": str(instance.phone_number) if instance.phone_number else None,
                "type_user": instance.type_user,
                "age": instance.age,
                "ppermis_ic": instance.ppermis_ic.url if instance.ppermis_ic else None,
                "user_pic": instance.user_pic.url if instance.user_pic else None,
            }
        }    


# comments_rating serializer
class CommentsSerializer (serializers.ModelSerializer):
    author_comment = serializers.SerializerMethodField()
    
    class Meta : 
        model = comments_rating
        fields =['title', 'rating' ,'comment', 'author_comment','received_user']
    
    def get_author_comment(self, obj):
        return obj.author_comment.username


# posts serializer
class PostsSerializer(serializers.ModelSerializer):
    author_post = serializers.StringRelatedField() 
    class Meta : 
        model = posts
        fields = [ 'id',
    'title','author_post','depart_date','arrival_date','depart_place','arrival_place','number_of_places','animals_autorised','smoker','price',
                 ]
        #extra_fields = {"autor": {"read_only": True}}



class PostsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = posts
        fields = '__all__'
        extra_kwargs = {
            'title': {'required': False},
            'depart_date': {'required': False},
            'arrival_date': {'required': False},
            'arrival_place': {'required': False},
            'depart_place': {'required': False},
            'price': {'required': False},
            'reserved': {'required': False},
            'number_of_places': {'required': False},
            'smoker': {'required': False},
            'animals_autorised': {'required': False},
            'author_post' : {'read_only':True}
        }        

        


# history serializer 
class HistorySerializer(serializers.ModelSerializer):
    post = PostsSerializer()  # Nested serializer for post details
    visitor = userview_serializer()  # Nested serializer for visitor details
    
    class Meta:
        model = history
        fields = ['id', 'post', 'visitor', 'visited_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Format the date
        if 'visited_at' in representation:
            visited_at = instance.visited_at
            representation['visited_at'] = visited_at.strftime('%d %B %Y')
        return representation
        