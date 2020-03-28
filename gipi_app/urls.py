from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login, name='login'),
    path('signUp', views.sign_up, name='signUp'),
    path('logOut', views.log_out, name='logOut')
]
