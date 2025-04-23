from django.contrib.auth.models import User # for users autentification 
from rest_framework import serializers # used to convert json data 
from users.models import profile , comments_rating
from posts.models import posts
from rest_framework_simplejwt.tokens import RefreshToken
from history.models import history
# users serialzers
class user_serializer (serializers.ModelSerializer):
    class Meta : 
        model = profile
        fields = ["email","username","phone_number","type_user","age","password","phone_number","ppermis_ic", "user_pic"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = profile.objects.create_user(**validated_data)  
        return user
    def to_representation(self, instance):
        
        refresh = RefreshToken.for_user(instance)

        return {
            "user": {
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
        fields = ["email","username","phone_number","type_user","age","password","phone_number","ppermis_ic", "user_pic"]
        extra_kwargs = {"password": {"write_only": True}}


    def to_representation(self, instance):
        

        return {
            "user": {
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
    # author_comment = serializers.SlugRelatedField(
    # slug_field='username',  # uses profile.username
    # queryset=profile.objects.all(),
    # #read_only=True  # optional, if you always want to set it in views
    #       )

    # received_user = serializers.SlugRelatedField(
    #     slug_field='username',
    #     queryset=profile.objects.all()
    #      #read_only=True
    #    )
    class Meta : 
        model = comments_rating
        fields =['title', 'rating' ,'comment', 'author_comment','received_user']
        #read_only_fields = ['author_comment', 'received_user']


# posts serializer
class PostsSerializer(serializers.ModelSerializer):
    author_post = serializers.StringRelatedField() 
    class Meta : 
        model = posts
        fields = [
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
    class Meta :
        model = history 
        fields = ['post','visitor']       
        # def to_representation(self, instance):
        
        

        #     return {
        #     "post": {
        #         "email": instance.email,
        #         "username": instance.username,
        #         "phone_number": str(instance.phone_number) if instance.phone_number else None,
        #         "type_user": instance.type_user,
        #         "age": instance.age,
        #         "ppermis_ic": instance.ppermis_ic.url if instance.ppermis_ic else None,
        #         "user_pic": instance.user_pic.url if instance.user_pic else None,
        #     },
        #     "refresh": str(refresh),
        #     "access": str(refresh.access_token),
        # }     
        