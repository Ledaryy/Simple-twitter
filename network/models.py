from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.fields.related import ManyToManyField


class User(AbstractUser):
    following = ManyToManyField("User", related_name="follower")
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "following": self.following.count(),
            "followers": self.follower.count()
        }

class Post(models.Model):
    owner = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    text = models.TextField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    liked_by = models.ManyToManyField("User", related_name="liked_posts")

    def serialize(self):
        return {
            "id": self.id,
            "owner": self.owner.username,
            "text": self.text,
            "likes": self.liked_by.count(),
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }
