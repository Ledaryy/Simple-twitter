import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post

@csrf_exempt
def index(request):
     
    # Loading posts to main page
    
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
def send_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)

    post = Post(
        owner = request.user,
        text = data.get("text", "")
    )

    post.save()
    return JsonResponse({"message": "Created post."}, status=203)

@csrf_exempt
def posts(request, page):

    # retriving posts from database, if 0 fetched, return the numbers of pages
    if page == 0:
        posts = Post.objects.all()
        sorted_posts = posts.order_by("-timestamp").all()
        pages = Paginator(sorted_posts, 10)
        return JsonResponse(pages.num_pages, safe=False)

    posts = Post.objects.all()
    sorted_posts = posts.order_by("-timestamp").all()
    pages = Paginator(sorted_posts, 10)
    return JsonResponse([post.serialize() for post in pages.page(page)], safe=False)


@csrf_exempt
def likes(request, post_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    post = Post.objects.get(pk=post_id)
    user = User.objects.get(username = request.user)

    # if user already liked this post, remove the like
    if user in post.liked_by.all():

        post.liked_by.remove(user)
        post.save()
        return JsonResponse({"message": "Like removed"}, status=200)

    # add users like to post
    post.liked_by.add(user)
    post.save()


    return JsonResponse({"message": "Like added"}, status=200)

def user(request):
    
    # return infromation about the user

    if request.user.is_authenticated:
        # list of liked posts
        user = User.objects.get(username=request.user)
        posts = Post.objects.filter(liked_by=user)
        id_set = []
        for post in posts:
            id_set.append(post.id)

        return JsonResponse({
            "authenticated": True,
            "username": request.user.serialize(),
            "liked_posts": id_set
        }, status=200)
    else:
        return JsonResponse({
            "authenticated": False,
            "username": "error"
        }, status=200)

@csrf_exempt
def update_post(request):

    # update the post, when user finished editing
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    post = Post.objects.get(pk=data.get("postId", ""))
    post.text = data.get("text", "")
    post.save()
    return JsonResponse({"message": "Post updated"}, status=200)

@csrf_exempt
def profile(request, username):
    
    # when user click on someones profile, saving this data to the session
    request.session["users_profile"] = username
    return render(request, "network/profile.html")

    
def users_posts(request, page):

    # same logic as a "posts", but only specific posts from user
    target = User.objects.get(username=request.session["users_profile"]).serialize()
    target_clear = User.objects.get(username=request.session["users_profile"])


    if page == 0:
        posts = Post.objects.filter(owner=target["id"])
        sorted_posts = posts.order_by("timestamp").all()
        pages = Paginator(sorted_posts, 10)
        return JsonResponse(pages.num_pages, safe=False)

    posts = Post.objects.filter(owner=target["id"])
    sorted_posts = posts.order_by("timestamp").all()
    pages = Paginator(sorted_posts, 10)

    # if user following the profile, which he watching at the moment, return true
    if request.user.is_authenticated:
        user = User.objects.get(username=request.user)
        if target_clear in user.following.all():
            followed = True
        else:
            followed = False
        return JsonResponse({
            "posts": [post.serialize() for post in pages.page(page)],
            "profile": target,
            "followed": followed
        }, safe=False)
    return JsonResponse({
            "posts": [post.serialize() for post in pages.page(page)],
            "profile": target
        }, safe=False)


@csrf_exempt
def follow_user(request, username):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    user = User.objects.get(username = request.user)
    target = User.objects.get(username = username)

    # if user already followed the user, remove the subscribtion
    if target in user.following.all():

        user.following.remove(target)
        user.save()
        return JsonResponse({"message": "Unfollowed"}, status=200)

    # if very tricky user, using url path, trying to follow himself
    if target == user:
        return JsonResponse({"message": "No way!"})

    # following the target
    user.following.add(target)
    user.save()

    return JsonResponse({"message": "Followed"}, status=200)

def following(request):

    # if user wants to acces following page without login

    if request.user.is_authenticated:
        return render(request, "network/following.html")

    else:
        return HttpResponseRedirect(reverse("login"))
    

@csrf_exempt
def following_posts(request, page):

    user = User.objects.get(username = request.user)
    
    # same as "posts" logic, but gives multiple results from sevaral followed users
    if page == 0:
        posts = Post.objects.filter(owner__in=user.following.all())
        sorted_posts = posts.order_by("-timestamp").all()
        pages = Paginator(sorted_posts, 10)
        return JsonResponse(pages.num_pages, safe=False)

    posts = Post.objects.filter(owner__in=user.following.all())
    sorted_posts = posts.order_by("-timestamp").all()
    pages = Paginator(sorted_posts, 10)
    return JsonResponse([post.serialize() for post in pages.page(page)], safe=False)

