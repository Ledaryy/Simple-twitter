
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("following", views.following, name="following"),

    # API routes
    path("posts/<int:page>", views.posts, name="posts"),
    path("users-posts/<int:page>", views.users_posts, name="posts"),
    path("user", views.user, name="user"),
    path("send-post", views.send_post, name="send-post"),
    path("like-post/<int:post_id>", views.likes, name="like-post"),
    path("update-post", views.update_post, name="update-post"),
    path("follow-user/<str:username>", views.follow_user, name="follow-user"),
    path("following-posts/<int:page>", views.following_posts, name="following-posts")
    
]
