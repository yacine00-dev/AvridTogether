



from django.contrib import admin
from django.urls import path ,include
from api.views import CreatUserView
from rest_framework_simplejwt.views import TokenObtainPairView , TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register', CreatUserView.as_view(), name = 'register'), 
    path('api/token/', TokenObtainPairView.as_view(), name= 'get_token'),
    path('api/token/Refresh', TokenRefreshView.as_view(), name= 'Refresh') ,  
    path('api-auth/', include("rest_framework.urls")) ,  
]
