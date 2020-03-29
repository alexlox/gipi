from django.shortcuts import render, redirect
from django.http import HttpResponseBadRequest, HttpResponse
from .models import User, History
from django.contrib.auth.hashers import make_password, check_password
import json
import dateutil.parser
import speech_recognition as sr
from io import BytesIO

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

    data = json.loads(request.body)

    if 'username' not in data or 'password' not in data:
        return HttpResponseBadRequest('{ "message": "Please fill all fields." }')

    username = data['username'].strip()
    password = data['password'].strip()

    if username == '' or password == '':
        return HttpResponseBadRequest('{ "message": "Please fill all fields." }')

    resp = HttpResponse()

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        resp.status_code = 401
        resp.write('{ "message": "Wrong username or password." }')
        return resp

    if check_password(password, user.password):
        request.session["username"] = username
        resp.status_code = 200
    else:
        resp.status_code = 401
        resp.write('{ "message": "Wrong username or password." }')

    return resp


def sign_up(request):
    if request.method == 'GET':
        return render(request, 'gipi_app/sign_up.html')

    data = json.loads(request.body)

    if 'username' not in data or 'password' not in data:
        return HttpResponseBadRequest('{ "message": "Please fill all fields." }')

    username = data['username'].strip()
    password = data['password'].strip()

    if username == '' or password == '':
        return HttpResponseBadRequest('{ "message": "Please fill all fields." }')
    if len(username) > 64:
        return HttpResponseBadRequest('{ "message": "Username is too big." }')
    if len(User.objects.filter(username=username)) != 0:
        return HttpResponseBadRequest('{ "message": "Username already taken." }')

    user = User(username=username, password=make_password(password))
    user.save()

    request.session['username'] = username
    return HttpResponse()


def log_out(request):
    del request.session['username']
    return redirect('/')


def coordinates(request):
    if request.method != 'POST':
        return HttpResponseBadRequest()

    data = json.loads(request.body)

    # Error Handling
    if 'latitude' not in data or 'longitude' not in data or 'timestamp' not in data:
        return HttpResponseBadRequest('{ "message": "Provide longitude, latitude and timestamp." }')
    if type(data['latitude']) is not float or type(data['longitude']) is not float:
        return HttpResponseBadRequest('{ "message": "Latitude and longitude must be decimal point numbers." }')

    timestamp = dateutil.parser.isoparse(data['timestamp'])
    user = User.objects.filter(username=request.session['username'])[0]

    history = History(latitude=data['latitude'], longitude=data['longitude'], timestamp=timestamp, user=user)
    history.save()

    return HttpResponse()


def question(request):
    file = BytesIO(request.body)
    user_question = sr.AudioFile(file)

    file.close()
    return HttpResponse('{ "message": "OK" }')
