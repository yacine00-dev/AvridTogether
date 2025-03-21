from django.shortcuts import render
from users.models import profile
from rest_framework import generics
from .serializers import user_serializer
from rest_framework.permissions import AllowAny , IsAuthenticated
from rest_framework.response import Response

class CreatUserView(generics.CreateAPIView):
    queryset= profile.objects.all()
    serializer_class = user_serializer
    permission_classes = [AllowAny]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()  # Save returns the user instance
        return Response(serializer.to_representation(user))  # Return formatted response
