from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from api.views import CreatUserView, UserLogoutView, UserUpdateView, UserDeleteView, CreatePost, DeletePost, UPdatePost, GetPosts, GetUserComment, GetComment, GetHistory, UpdateComment, CreateComment, DeleteComment, Reservation, UserProfileView, UserselfView, Reservationid, UserProfileViewmail, GetCommentemail, Reservation_annule, CreateCommentmail, Gettrajet ,Getreservation
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    #users urls
    path('api/user/register', CreatUserView.as_view(), name = 'register'), 
    path('api/token/', TokenObtainPairView.as_view(), name= 'get_token'),
    path('api/token/refresh', TokenRefreshView.as_view(), name= 'token_refresh') ,  
    path('api-auth/', include("rest_framework.urls")) ,  
    path('api/user/logout',UserLogoutView.as_view(),name= 'logout'), #in case a bug happens un comment this 
    path('api/user/update',UserUpdateView.as_view(), name='modifie_user'), 
    path('api/user/delete/<str:username>/', UserDeleteView.as_view(), name='delete_user'),
    path('api/user/<str:username>/', UserProfileView.as_view(), name='get_user'), # use this to veiw a 
    path('api/user/email/<str:email>/', UserProfileViewmail.as_view(), name='get_user_email'), # use this to veiw a 
    path('api/user/id/<int:id>/', UserselfView.as_view(), name='get_selfuser'), # use this when logging  in note it can aslo be used to get the user infos 


    # posts urls

    path('api/posts/reservation/<str:title>/', Reservation.as_view(), name = 'Reservation'),
    path('api/posts/reservation_annule/<str:title>/', Reservation_annule.as_view(), name = 'Reservation_annule'),
    path('api/posts/reservationid/<int:id>/', Reservationid.as_view(), name = 'Reservationid'),
    path('api/posts/creat_post/', CreatePost.as_view(), name='new_post'),
    path('api/posts/delete/<str:title>/', DeletePost.as_view(), name='delete_post'), #int:pk mean the number of the pots i.e id of teh post , because it needs to be specified 
    path('api/posts/update/<str:title>/', UPdatePost.as_view(), name='update_post'),
    path('api/posts/find/<str:depart_place>/<str:arrival_place>/', GetPosts.as_view(), name='find_posts'), # see an exemple how it works im not sure if returs the posts or the id of posts 

    # path('api/posts/<str:title>/', PostDetailView.as_view(), name='detail_posts'), # see an exemple how it works im not sure if returs the posts or the id of posts 
    # add get post just add history view to same urls ? update : history is created when sending a get request for a posts , but not when searching 

    #commenst_rating urls 
    path('api/user/mycomments', GetUserComment.as_view(), name='logged_user_comments'), 
    path('api/user/comments/<str:received_user>/', GetComment.as_view(), name='getcomments'), # 
    path('api/user/comments/email/<str:received_email>/', GetCommentemail.as_view(), name='getcomments'), # 
    path('api/user/comments/creat/<str:received_username>/', CreateComment.as_view(), name='creatcomments'), # 
    path('api/user/comments/creatmail/<str:mail_username>/', CreateCommentmail.as_view(), name='creatcomments'), # 
    path('api/user/comments/delete/<str:received_username>/', DeleteComment.as_view(), name='deletcomments'), # 
    path('api/user/comments/update/<str:received_username>/', UpdateComment.as_view(), name='updatecomments'), # 


    # hsitory 
    # i gess just a simple get all posts 
    path('api/user/history',GetHistory.as_view(), name='user_history') ,
    path('api/user/trajet',Gettrajet.as_view(), name='user_trajet') , 
    path('api/user/myreservation',Getreservation.as_view(), name='user_trajet'),

]

# Add media serving in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
