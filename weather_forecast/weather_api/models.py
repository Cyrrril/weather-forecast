from django.db import models

class City(models.Model):
    city = models.CharField(max_length=50)
    month = models.IntegerField()
    day = models.IntegerField()
    year = models.IntegerField()

    def __str__(self):
        return self.city
