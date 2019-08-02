from django import forms

class UserIn(forms.Form):
    response = forms.CharField(max_length=100)