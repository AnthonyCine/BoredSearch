from rest_framework import serializers
from .models import Users, Contents, ViewedContents, Folders


class UsersSerializers(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'password', 'interests', 'is_active', 'is_superuser', 'is_staff']


class ContentsSerializers(serializers.ModelSerializer):
    class Meta:
        model = Contents
        fields = ['id', 'title', 'link', 'topics', 'search_type', 'snippet', 'is_safe', 'source', 'posted_by',
                  'aspect_ratio', 'thumbnail', 'main_keyword']


class FoldersSerializers(serializers.ModelSerializer):
    class Meta:
        model = Folders
        fields = ['id', 'user', 'folders']


class ViewedContentsSerializers(serializers.ModelSerializer):
    class Meta:
        model = ViewedContents
        fields = ['user', 'content_id']
