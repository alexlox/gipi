from django.shortcuts import render
from django.http import HttpResponseBadRequest, HttpResponse
from .models import User
from django.contrib.auth.hashers import make_password

# Create your views here.


def index(request):

    authenticated = True if "username" in request.session else False
    username = request.session["username"] if "username" in request.session else ""

    context = {
        "user": {
            "authenticated": authenticated,
            "username": username
        }
    }
    return render(request, 'gipi_app/index.html', context)


def login(request):
    if request.method == 'GET':
        return render(request, 'gipi_app/login.html')

    username = request.body['username'].strip()
    password = request.body['password'].strip()

    if username == '' or password == '':
        return HttpResponseBadRequest('{ "message": "Please fill all fields." }')

    resp = HttpResponse()

    if len(User.objects.filter(username=username, password=make_password(password))) > 0:
        request.session["username"] = username
        resp.status_code = 200
    else:
        resp.status_code = 401
        resp.write('{ "message": "Wrong username or password." }')

    return resp


def sign_up(request):
    if request.method == 'GET':
        return render(request, 'gipi_app/sign_up.html')

    username = request.body['username'].strip()
    password = request.body['password'].strip()

    if username == '' or password == '':
        return HttpResponseBadRequest('{ "message": "Please fill all fields." }')
    if len(username) > 64:
        return HttpResponseBadRequest('{ "message": "Username is too big." }')
    if len(User.objects.filter(username=username)) != 0:
        return HttpResponseBadRequest('{ "message": "Username already taken." }')

    user = User(username=username, password=make_password(password))
    user.save()

    request.session["username"] = username
    return HttpResponse()
