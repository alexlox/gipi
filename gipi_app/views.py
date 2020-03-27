from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.


def index(request):
    context = {
        "user": {
            "authenticated": False,
            "username": ""
        }
    }
    return render(request, 'gipi_app/index.html', context)
