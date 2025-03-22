



from django.contrib import admin
from django.urls import path ,include
from api.views import CreatUserView , UserLogoutView , UserUpdateView ,UserDeleteView
from rest_framework_simplejwt.views import TokenObtainPairView , TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),
    #users urls
    path('api/user/register', CreatUserView.as_view(), name = 'register'), 
    path('api/token/', TokenObtainPairView.as_view(), name= 'get_token'),
    path('api/token/refresh', TokenRefreshView.as_view(), name= 'token_refresh') ,  
    path('api-auth/', include("rest_framework.urls")) ,  
    path('api/user/logout',UserLogoutView.as_view(),name= 'logout'),
    path('api/user/update',UserUpdateView.as_view(), name='mofifie_user'), 
    path('api/user/delete', UserDeleteView.as_view(), name='delete_user')
    #posts urls
]
