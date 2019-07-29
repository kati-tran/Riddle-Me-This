# chat/views.py
from django.shortcuts import render
from django.utils.safestring import mark_safe
import json

def index(request):
    return render(request, 'chat/enter_chat.html', {})

def room(request, room_name):
   return render(request, 'chat/room.html', {
        'room_name_json': (json.dumps(room_name)), 'username': mark_safe(request.GET["username"])
    })
