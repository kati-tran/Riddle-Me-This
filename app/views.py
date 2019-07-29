from django.shortcuts import render
from django.views.generic import TemplateView

#vvv for GET/POST in html forms
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect, reverse
from .forms import temp_userForm

# Create your views here.
class HomePageView(TemplateView):
    def get(self, request, **kwargs):
        return render(request, 'index.html', context=None)
    def post(self,request, **kwargs):
        form = temp_userForm(request.POST)
        request.session['username'] = form['temp_user'].value()
        
        if form.is_valid():
            return HttpResponseRedirect('temp_user')
    
class temp_userView(TemplateView):
    def get(self, request, **kwargs):
        context = {'username': request.session['username']}
        return render(request, 'temp_user.html', context)

class tosView(TemplateView):
    def get(self, request, **kwargs):
        return render(request, 'tos.html')


