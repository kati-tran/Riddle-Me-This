from django.conf.urls import url
from app import views


urlpatterns = [
    url(r'^$', views.HomePageView.as_view()), # imports view from views.py
    url(r'^temp_user/$', views.temp_userView.as_view(), name='temp_user'),
    url(r'^terms_conditions/$', views.tosView.as_view())
]
