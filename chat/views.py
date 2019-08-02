# chat/views.py
from django.shortcuts import render
from django.utils.safestring import mark_safe
from .forms import UserIn
import json
from chat import generateRiddles as gr

def index(request):
    return render(request, 'chat/index.html', {})

def room(request, room_name):
	if form.is_valid():
		print(form.cleaned_data['response'])
    return render(request, 'chat/room.html', {
        'room_name_json': mark_safe(json.dumps(room_name)), 'username': request.session['username'],
        'riddles': json.dumps(list((gr.allRiddles(dict(),3)).items())),
    })

#'riddles': HttpResponse( json.dumps(getRiddle())
