from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import profile

class posts(models.Model):
   
    id = models.AutoField(primary_key=True,) #add this modifie the serializer if there is issue when proforming update or delete  + its starts automaticlly from 1
    title = models.CharField(max_length=25,unique=True)
    author_post = models.ForeignKey(profile ,on_delete=models.CASCADE, related_name='author_post')
    created_at = models.DateTimeField(auto_now_add=True)
    depart_date = models.TimeField()
    arrival_date = models.TimeField() 
    depart_place = models.CharField(max_length=70)
    arrival_place = models.CharField(max_length=70)
    price = models.FloatField(default=0)
    reserved = models.BooleanField(default=False)
    number_of_places=models.IntegerField(default=1)
    smoker = models.BooleanField(default=False)
    animals_autorised = models.BooleanField(default=False)

    def __str__(self):
        return self.title 