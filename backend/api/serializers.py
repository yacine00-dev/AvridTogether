from django.contrib.auth.models import User # for users autentification 
from rest_framework import serializers # used to convert json data 
from users.models import profile 
from rest_framework_simplejwt.tokens import RefreshToken

class user_serializer (serializers.ModelSerializer):
    class Meta : 
        model = profile
        fields = ["email","username","phone_number","type_user","rating","password","phone_number","ppermis_ic", "user_pic"]
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
                "rating": instance.rating,
                "ppermis_ic": instance.ppermis_ic.url if instance.ppermis_ic else None,
                "user_pic": instance.user_pic.url if instance.user_pic else None,
            },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }    


    def update(self, user, validated_data):
        # Update user fields
        for attr, value in validated_data.items():
            setattr(user, attr, value)
        user.save()
        return user     


    def delete(self , user , passwoord):    
        pass