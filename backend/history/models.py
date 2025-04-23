from django.db import models
from users.models import profile
from posts.models import posts

# Create your models here.
class history (models.Model):
    post = models.ForeignKey(posts ,on_delete=models.CASCADE, related_name='visited_post')
    visited_at = models.DateField(auto_now_add=True)
    visitor = models.ForeignKey(profile ,on_delete=models.CASCADE, related_name='visitor')
    def __str__(self):
        return f"{self.visitor.username} visited {self.post.title} on {self.visited_at}"
    

