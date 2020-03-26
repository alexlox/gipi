from django.db import models
import datetime

# Create your models here.


class User(models.Model):
    username = models.CharField(max_length=64)
    password = models.CharField(max_length=256)

    def __str__(self):
        return self.username


class History(models.Model):
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    timestamp = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return "({0}, {1})".format(self.latitude, self.longitude)
