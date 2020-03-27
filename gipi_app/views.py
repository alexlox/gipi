from django.shortcuts import render
from django.http import HttpResponseBadRequest
from gipi_app.models import User

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

    # if username == '' or password == '':
    #     return HttpResponseBadRequest('{ "message": "Please fill all fields." }')
    # if len(User.objects.filter(username=username)) != 0:
    #     return HttpResponseBadRequest('{ "message": "Username already taken." }')

    
