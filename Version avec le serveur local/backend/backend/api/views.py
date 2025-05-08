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

    def perform_update(self, serializer):
        serializer.save()  # The password handling is now done in the serializer



class UserDeleteView(generics.DestroyAPIView):
    queryset = profile.objects.all()
    serializer_class = user_serializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'username'

    def get_object(self):
        username = self.kwargs.get('username')
        return get_object_or_404(profile, username=username)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance != request.user:
            return Response(
                {"detail": "You can only delete your own account."},
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_destroy(instance)
        return Response(
            {"detail": "Account successfully deleted"},
            status=status.HTTP_204_NO_CONTENT
        )
    
class UserProfileView(generics.RetrieveAPIView):
    queryset = profile.objects.all()
    serializer_class = userview_serializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'username'
    def get_queryset(self):
        username = self.kwargs.get("username")
        return profile.objects.filter(username=username) 
class UserselfView(generics.RetrieveAPIView):
    queryset = profile.objects.all()
    serializer_class = userview_serializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    def get_queryset(self):
        id = self.kwargs.get("id")
        return profile.objects.filter(id =id )
    
class UserProfileViewmail(generics.RetrieveAPIView):
    queryset = profile.objects.all()
    serializer_class = userview_serializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'email'
    def get_queryset(self):
        email = self.kwargs.get("email")
        return profile.objects.filter(email =email )
    
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
            
class CreateCommentmail(generics.ListCreateAPIView):
    serializer_class = CommentsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user # turn this into email in case of issue 
        return comments_rating.objects.filter(author_comment=user)

    def perform_create(self, serializer):
        if serializer.is_valid():
            received_email= self.kwargs.get("mail_username")
            received_user = get_object_or_404(profile, email=received_email)

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
    
class GetCommentemail(generics.ListAPIView):
    serializer_class = CommentsSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        mail = self.kwargs.get("received_email")
        received_user = get_object_or_404(profile, email=mail)
        return comments_rating.objects.filter(received_user=received_user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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
    permission_classes = [IsAuthenticated]
    lookup_field = 'title'

    def get(self, request, title):
        post = get_object_or_404(posts, title=title)
        if post.reserved:
            return Response(
                {"error": "Ce trajet est déjà réservé"},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = self.request.user


    def post(self, request, title):
        post = get_object_or_404(posts, title=title)
        if post.reserved:
            return Response(
                {"error": "Ce trajet est déjà réservé"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        post.reserved = True
        post.save()
        user = self.request.user

        # Create the history record
        history.objects.create(
            post=post,
            visitor=user
        )
        return Response({
            "message": f"Le trajet '{post.title}' a été réservé avec succès.",
            "post_id": post.id
        })



class Reservationid(APIView):
    serializer_class = PostsSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def post(self, request, id):
        post = get_object_or_404(posts, id=id)
        if post.reserved:
            return Response(
                {"error": "Ce trajet est déjà réservé"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        post.reserved = True
        post.save()
        user = self.request.user

        # Create the history record
        history.objects.create(
            post=post,
            visitor=user
        )
        return Response({
            "message": f"Le trajet '{post.title}' a été réservé avec succès.",
            "post_id": post.id
        })

class Reservation_annule(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostsSerializer
    lookup_field = 'title'
        
    def post(self, request, title):
        post = get_object_or_404(posts, title=title)
        if not post.reserved:
            return Response(
                {"error": "Ce trajet n'est pas réservé"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        post.reserved = False
        post.save()
        history.objects.filter(post=post).delete()
        return Response({"message": f"La réservation du trajet '{post.title}' a été annulée."})

class Reservationid(APIView):
    serializer_class = PostsSerializer
    lookup_field = 'id'
    def post(self, request, title):
        user= self.request.user
        post = get_object_or_404(posts,id= id)
        post.reserved = True
        post.save()
       


        # Create the history record
        history.objects.create(
                depart_date = post.depart_date,
                arrival_date = post.arrival_date,
                depart_place = post.depart_place,
                arrival_place = post.arrival_place,
                price = post.price,
            
                visitor=user
        )
        return Response({"message": f"Post has been reserved."})


class GetHistory(generics.ListAPIView) :
    serializer_class = HistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return history.objects.filter(visitor=user).order_by('-visited_at')
    
class Getreservation(generics.ListAPIView) :
    serializer_class = HistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        post = get_object_or_404(posts,reserved = True , author_post = user)
        return history.objects.filter(post = post).order_by('-visited_at')
    
class Gettrajet(generics.ListAPIView):
    serializer_class = HistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Récupérer d'abord les posts de l'utilisateur qui sont réservés
        user_posts = posts.objects.filter(author_post=user, reserved=True)
        # Ensuite récupérer l'historique lié à ces posts
        return history.objects.filter(post__in=user_posts).order_by('-visited_at')
    
