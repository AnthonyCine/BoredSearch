from django.contrib import admin
from .models import Users, Contents, AccountVerification, FavoriteContents, ViewedContents

admin.site.register(Users)
admin.site.register(Contents)
admin.site.register(AccountVerification)
admin.site.register(FavoriteContents)
admin.site.register(ViewedContents)
