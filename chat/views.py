# chat/views.py
from django.shortcuts import render
from django.utils.safestring import mark_safe
from django.http import HttpResponse
import json
from chat.generateRiddles import *

def index(request):
    return render(request, 'chat/index.html', {})

def room(request, room_name):
    return render(request, 'chat/room.html', {
        'room_name_json': mark_safe(json.dumps(room_name)), 'username': request.session['username'], 'riddles': HttpResponse( json.dumps(getRiddle())) 
    })
