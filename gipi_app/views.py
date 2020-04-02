import datetime
import googlemaps
from time import strptime
from django.shortcuts import render, redirect
from django.http import HttpResponseBadRequest, HttpResponse
from .models import User, History
from django.contrib.auth.hashers import make_password, check_password
import json
import dateutil.parser
import speech_recognition as sr
from io import BytesIO
import unicodedata
import re


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

    recognizer_instance = sr.Recognizer()
    recognizer_instance.energy_threshold = 200

    with user_question as source:
        audio = recognizer_instance.record(source)

    try:
        stringy = recognizer_instance.recognize_google(audio, language='ro-RO')
    except sr.UnknownValueError:
        return HttpResponse('{ "message": "Speech is unintelligible." }')
    except sr.RequestError:
        return HttpResponse('{ "message": "Speech recognition failed." }')

    stringy = strip_accents(stringy)

    response = str(controller(parser(stringy)))

    file.close()
    return HttpResponse('{ "message": "' + response + '" }')


def controller(_dict):
    return str(_dict)


def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def parser(user_question):
    this_dict = {}

    search_location = re.match('cand.*la (.+)', user_question, re.IGNORECASE)
    search_time = re.match('unde.*la (.+)', user_question, re.IGNORECASE)

    if search_location is None and search_time is None:
        search_general = re.match('.*la (.+)', user_question, re.IGNORECASE)

        if search_general is None:
            return "Speech is unintelligible."

        time_from_general = re.match('[0-9:]+', search_general.group(1))

        if time_from_general is not None:
            this_dict['time'] = time_from_general.group(0)
        else:
            this_dict['location'] = search_general.group(1)

    if search_location is not None:
        location = search_location.group(1)
        this_dict['location'] = location
    elif search_time is not None:
        time = search_time.group(1)
        this_dict['time'] = time

    return this_dict


# def switch_compute(dictionary):
#     if "location" in dictionary.keys():
#         compute_location(dictionary["location"])
#     else:
#         if "time" in dictionary.keys():
#             compute_time(dictionary["time"])


def compute_location():
    gmaps = googlemaps.Client(key="AIzaSyAjawcZ0rRWBr-cQBMwjk1xbeV5KsowvHw")
    geocode_result = gmaps.geocode('Strada Atelierului 4, Iași, Romania')
    datalist = list()
    lat = 0
    lng = 0
    for addreses in geocode_result:
        try:
            lng = addreses["geometry"]["location"]["lng"]
            lat = addreses["geometry"]["location"]["lat"]
        except KeyError:
            err = list()

    # 27.57481 - Baza de date
    # 27.603963 - Google Maps

    aux = None

    for x in History.objects.raw("Select * from gipi_app_history where latitude >= %s and latitude <= %s and "
                                 "longitude <= %s and longitude >= %s", [lat - 0.2, lat + 0.2, lng + 0.2, lng - 0.2]):
        # datalist.append(x)
        if aux is None:
            aux = (abs(lat - float(x.latitude)) + abs(lng - float(x.longitude))) / 2
            timestamp_object = x
        else:
            if (abs(lat - float(x.latitude)) + abs(lng - float(x.longitude))) / 2 < aux:
                aux = (abs(lat - float(x.latitude)) + abs(lng - float(x.longitude))) / 2
                timestamp_object = x

    return str(timestamp_object.timestamp.hour) + ":" + str(timestamp_object.timestamp.minute)


def compute_time():
    input_data = strptime("19:00:00", "%H:%M:%S")
    currentDT = datetime.datetime.now()
    time = currentDT.replace(hour=input_data.tm_hour, minute=input_data.tm_min,
                             second=input_data.tm_sec) - datetime.timedelta(days=1)

    d2 = datetime.datetime.strptime(str(time), "%Y-%m-%d %H:%M:%S.%f")
    aux = None
    location_object = None
    for x in History.objects.raw("Select * from gipi_app_history where timestamp >= %s and timestamp <= %s ",
                                 [time - datetime.timedelta(minutes=30), time + datetime.timedelta(minutes=30)]):

        d1 = datetime.datetime.strptime(str(x.timestamp), "%Y-%m-%d %H:%M:%S.%f%z").replace(tzinfo=None)

        if aux is None:
            aux = abs((d1 - d2).total_seconds())
            location_object = x
        else:
            if abs((d1 - d2).total_seconds()) < aux:
                aux = abs((d1 - d2).total_seconds())
                location_object = x

    gmaps = googlemaps.Client(key="AIzaSyAjawcZ0rRWBr-cQBMwjk1xbeV5KsowvHw")
    reverse_geocode_result = gmaps.reverse_geocode((location_object.latitude, location_object.longitude))

    datalist = list()

    for addreses in reverse_geocode_result:
        try:
            datalist.append(addreses['formatted_address'])
        except KeyError:
            datalist = list()
    return str(datalist[0])
