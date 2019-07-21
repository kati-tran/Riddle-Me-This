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
        username = form['temp_user'].value()
        
        if form.is_valid():
            #return HttpResponseRedirect('temp_user')
            return redirect(reverse('temp_user')+f'?username={username}')
    
class temp_userView(TemplateView):
    def get(self, request, **kwargs):
        username = request.GET["username"]
        context = {'username': username}
        return render(request, 'temp_user.html', context)


