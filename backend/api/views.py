from django.shortcuts import render
from users.models import profile
from rest_framework import generics
from .serializers import user_serializer 
from rest_framework.permissions import AllowAny , IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken



class CreatUserView(generics.CreateAPIView):
    queryset= profile.objects.all()
    serializer_class = user_serializer
    permission_classes = [AllowAny]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()  # Save returns the user instance
        return Response(serializer.to_representation(user))  # Return formatted response
    

class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the refresh token
            return Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)


 
class UserUpdateView(generics.UpdateAPIView):
    queryset = profile.objects.all()
    serializer_class = user_serializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return profile.objects.get(user=self.request.user) # Only allow updating the logged-in user's profile


class UserDeleteView(APIView):
    pass 
