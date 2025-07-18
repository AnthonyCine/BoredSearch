from django.contrib import admin
from .models import Users, Contents, ViewedContents

admin.site.register(Users)
admin.site.register(Contents)
admin.site.register(ViewedContents)
