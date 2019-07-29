# chat/urls.py
from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='enter_chat'),
    url(r'^(?P<room_name>[^/]+)/$', views.room, name='room'),
]
