from rest_framework import serializers
from .models import Users, Contents, FavoriteContents, ViewedContents, AccountVerification, Folders


class UsersSerializers(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'password', 'interests']


class AccountVerificationSerializers(serializers.ModelSerializer):
    class Meta:
        model = AccountVerification
        fields = ['token', 'expiration', 'user']


class ContentsSerializers(serializers.ModelSerializer):
    class Meta:
        model = Contents
        fields = ['id', 'title', 'link', 'topics', 'search_type', 'snippet', 'is_safe', 'source', 'posted_by',
                  'aspect_ratio', 'thumbnail']


class FoldersSerializers(serializers.ModelSerializer):
    class Meta:
        model = Folders
        fields = ['user', 'name']


class FavoriteContentsSerializers(serializers.ModelSerializer):
    class Meta:
        model = FavoriteContents
        fields = ['user', 'content_id', 'folder']


class ViewedContentsSerializers(serializers.ModelSerializer):
    class Meta:
        model = ViewedContents
        fields = ['user', 'content_id']
