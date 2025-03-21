from django.db import models
from django.contrib.auth.models import User ,AbstractBaseUser, BaseUserManager, PermissionsMixin
from phonenumber_field.modelfields import PhoneNumberField
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

# class profile(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None,**extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        
        return user    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)    

class profile(AbstractBaseUser,PermissionsMixin):
    #user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,primary_key=True) # in case you want youre user to inherite from django defined user uncomment one of the lines 
    #user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    email = models.EmailField(unique=True)
    user_pic = models.ImageField(null=True ,upload_to="profile/pfimage", height_field=None, width_field=None, max_length=None) #need to specifie the path in the data base 
    
    username = models.CharField(max_length=150, unique=True, blank=True)  # Allow blank username
    phone_number = PhoneNumberField(blank=True, null=True) #need to specifie the path in the data base 
    password =models.CharField(max_length=50) # path to store i data base(_(""), max_length=50)
    conducteur = "conducteur"
    clien = "clien"
    utypes = { conducteur :"conducteur", 
             clien :"clien",}
    type_user = models.CharField(max_length=10 , choices = utypes , default=clien,blank=True, null=True)
    ppermis_ic = models.ImageField(null=True ,upload_to="profile/permis_ic", height_field=None, width_field=None, max_length=None) #need to specifie the path in the data base 
    rating = models.IntegerField(default=0) #need to ask how the frant end will implent in order to know how to define it 

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'  # Use 'email' if you prefer email login
    REQUIRED_FIELDS = []


    def __str__(self):
        return self.email
    

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        profile.objects.create(user=instance)    
    
