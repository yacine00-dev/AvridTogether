from django.shortcuts import render
from users.models import profile
from rest_framework import generics
from .serializers import user_serializer ,PostsSerializer, CommentsSerializer,HistorySerializer ,PostsUpdateSerializer ,userview_serializer
from rest_framework.permissions import AllowAny , IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from posts.models import posts 
from users.models import comments_rating
from history.models import history
from django.shortcuts import get_object_or_404

# users / profile 
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
    permission_classes = [IsAuthenticated]  #make it is authenftifated after tests : c bn 
    
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
        return profile.objects.get(email=self.request.user.email) # Only allow updating the logged-in user's profile
        #return profile.objects.get(email=self.request.user.email)
    def perform_update(self, serializer):
        user = serializer.save()
        if 'password' in self.request.data:
            user.set_password(self.request.data['password'])  # when setting a new password this will alow us to hash it , thus prevent issue when logging with teh new password
            user.save()



class UserDeleteView(generics.DestroyAPIView):
    queryset = profile.objects.all()
    serializer_class = user_serializer
    permission_classes = [IsAuthenticated]  ###

    def get_object(self):
        return profile.objects.get(email=self.request.user.email) # Only allow updating the logged-in user's profile
    
class UserProfileView(generics.RetrieveAPIView):
    queryset = profile.objects.all()
    serializer_class = userview_serializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'username'


#posts 

class CreatePost(generics.ListCreateAPIView):
    serializer_class = PostsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return posts.objects.filter(author_post=user) 

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author_post=self.request.user)
        else:
            print(serializer.errors)

class DeletePost(generics.DestroyAPIView):
    serializer_class = PostsSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'title' 
    def get_queryset(self):
        title = self.kwargs.get('title')
        return posts.objects.filter(title = title)  # delete only the posts that is owned by the user
        
class UPdatePost(generics.UpdateAPIView):
    serializer_class = PostsUpdateSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'title' 
    def get_queryset(self):
        title = self.kwargs.get('title')
        return posts.objects.filter(title = title)

class GetPosts(generics.ListAPIView):  #searhc posts 
    serializer_class = PostsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        arrival_place = self.kwargs.get("arrival_place") 
        depart_place = self.kwargs.get("depart_place")
    
        # Filter comments by depart_place and arrival_place
        return posts.objects.filter(arrival_place=arrival_place, depart_place=depart_place)
    

#   ## check this again     no need for it i guess
# class PostDetailView(generics.RetrieveAPIView):
    
#     serializer_class = PostsSerializer
#     permission_classes = [IsAuthenticated]
#     lookup_field = 'title' 
#     def get_queryset(self):
#         title = self.kwargs.get('title')
#         return posts.objects.filter(title = title)


# commenst_rating 
class CreateComment(generics.ListCreateAPIView):
    serializer_class = CommentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user # turn this into email in case of issue 
        return comments_rating.objects.filter(author_comment=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            received_username= self.kwargs.get("received_username")
            received_user = get_object_or_404(profile, username=received_username)
            serializer.save(author_comment=self.request.user,received_user=received_user)
            #return self.post()
        else:
            print(serializer.errors)

class DeleteComment(generics.DestroyAPIView):
    serializer_class = CommentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):  # the return on cas problem
        user = self.request.user
        received_username= self.kwargs.get("received_username")
        received_user = get_object_or_404(profile, username=received_username)
        return comments_rating.objects.filter(author_comment=user, received_user= received_user)
        
# class UpdateComment(generics.UpdateAPIView):
#     serializer_class = CommentsSerializer
#     permission_classes = [IsAuthenticated]
#     lookup_field = 'received_user__username'
#     lookup_url_kwarg = 'received_user'

#     def get_queryset(self):
#         username = self.kwargs.get("received_user")
#         received_user = get_object_or_404(profile, username=username)
#         author = self.request.user
#         return comments_rating.objects.filter(received_user=received_user, author_comment=author)

class UpdateComment(generics.UpdateAPIView):
    serializer_class = CommentsSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        username = self.kwargs.get("received_user")
        received_user = get_object_or_404(profile, username=username)
        return comments_rating.objects.filter(received_user=received_user)


class GetComment(generics.ListAPIView):
    serializer_class = CommentsSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        username = self.kwargs.get("received_user")
        received_user = get_object_or_404(profile, username=username)
        return comments_rating.objects.filter(received_user=received_user)

    

class GetUserComment(generics.ListAPIView):
    serializer_class = CommentsSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        received_user = self.request.user  # in case of Error self.request.user.username

        return comments_rating.objects.filter(received_user= received_user)
    


######
# check how tim deleted his note apply th same 

class Reservation(APIView):
    serializer_class = PostsSerializer
    lookup_field = 'title'
    def post(self, request, title):
        post = get_object_or_404(posts,title= title)
        post.reserved = True
        post.save()
        user= self.request.user


        # Create the history record
        history.objects.create(
            post=post,
            visitor=user
        )
        return Response({"message": f"Post '{post.title}' has been reserved."})



class GetHistory(generics.ListAPIView) :
    serializer_class = HistorySerializer
    permission_classes =[IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return history.objects.filter(visitor=user)