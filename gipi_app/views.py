from django.shortcuts import render
from django.http import HttpResponseBadRequest, HttpResponse
from gipi_app.models import User
from django.contrib.auth.hashers import make_password

# Create your views here.


def index(request):
    context = {
        "user": {
            "authenticated": False,
            "username": ""
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

    # if len(User.objects.filter(username=username)) != 0:
    #     return HttpResponseBadRequest('{ "message": "Username already taken." }')


