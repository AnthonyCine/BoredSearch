from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token


class CustomManager(BaseUserManager):
    def crete_user(self, username, password, email, is_staff=False, is_active=True, is_superuser=False,
                   **other_fields):
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, is_staff=is_staff, is_active=is_active,
                          is_superuser=is_superuser, **other_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, password, email, **other_fields):
        other_fields.setdefault('is_staff', True)
        other_fields.setdefault('is_superuser', True)
        other_fields.setdefault('is_active', True)

        user = self.crete_user(username, password, email, is_staff=True, is_active=True, is_superuser=True)
        return user


class Users(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=200, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=200)
    date_joined = models.DateTimeField(auto_now_add=True)
    interests = models.CharField(max_length=200, blank=True, null=True)

    is_active = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    objects = CustomManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'password']

    def __str__(self):
        return self.username


class Contents(models.Model):
    title = models.CharField(max_length=200, null=True, blank=True)
    link = models.URLField(max_length=300, unique=True) #url to actual content
    topics = models.TextField(null=True, blank=True)
    search_type = models.CharField(max_length=10, null=True, blank=True) #search_type=web, image, video etc.
    snippet = models.CharField(max_length=500, null=True, blank=True)
    source = models.CharField(max_length=500, null=True, blank=True)
    posted_by = models.CharField(max_length=100, null=True, blank=True)
    aspect_ratio = models.CharField(max_length=100, blank=True, null=True)
    thumbnail = models.URLField(max_length=600, blank=True, null=True)
    main_keyword = models.CharField(max_length=200, null=True, blank=True)
    is_safe = models.BooleanField(default=True)
    publish_ready = models.BooleanField(default=False)

    def __str__(self):
        return self.title, self.link, self.topics, self.search_type, self.snippet, self.source, self.posted_by, \
               self.is_safe, self.aspect_ratio, self.thumbnail, self.publish_ready, self.main_keyword


class Folders(models.Model):
    user = models.ForeignKey(Users, related_name='myfolder', on_delete=models.CASCADE)
    folders = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.user, self.folders


class ViewedContents(models.Model):
    user = models.ForeignKey(Users, related_name='userviewed', on_delete=models.CASCADE)
    content_id = models.ForeignKey(Contents, related_name='contentviewed', on_delete=models.CASCADE, null=True)

    def __str__(self):
        return self.user, self.content_id


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)
