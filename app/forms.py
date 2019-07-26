from django import forms

class temp_userForm(forms.Form):
    temp_user = forms.CharField(label='nickname', max_length=30)
