from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Contents, Users, ViewedContents, Folders
from .serializers import ContentsSerializers, UsersSerializers, ViewedContentsSerializers, FoldersSerializers
from rest_framework.authtoken.models import Token
from .email_verification import EmailVerify, PasswordResetEmail
from .unique_identification import IdentificationGenerator
from difflib import get_close_matches
from .redflags import *
import json


class KeywordCheck:

    def check_keyword(self, keyword):
        cutoff_percentage = 0.8
        check_result_forbidden = get_close_matches(keyword, FORBIDDEN_KEYWORDS, cutoff=cutoff_percentage)
        check_result_alerting = get_close_matches(keyword, ALERTING_KEYWORDS, cutoff=cutoff_percentage)
        if len(check_result_forbidden) > 0:
            return 'forbidden'
        elif len(check_result_alerting) > 0:
            return 'alerting'
        else:
            return 'good'

keyword_checker = KeywordCheck()


def get_home(request):
    return HttpResponse(status=200)
    # return render(request, 'templates/index.html')


class ContentEdits(APIView):

    def get(self, request, sort='all'):
        if sort != 'all':
            all_contents = Contents.objects.filter(source=sort)
        else:
            all_contents = Contents.objects.all()
        contents_serial = ContentsSerializers(all_contents, many=True)
        return JsonResponse({'contents': contents_serial.data}, status=200)

    def post(self, request, pk, editing):
        edit = JSONParser().parse(request)
        edit = edit['edit']
        content = Contents.objects.get(pk=pk)
        if editing == 'thumbnail':
            content.thumbnail = edit
            content.save()
        elif editing == 'aspectratio':
            content.aspect_ratio = edit
            content.save()
        elif editing == 'safe':
            content.is_safe = edit
            content.save()
        return Response(status=200)

    def delete(self, request, pk, all):
        if all == 'yes':
            content = Contents.objects.all()
        else:
            content = Contents.objects.get(pk=pk)
        content.delete()
        return Response(status=200)


class DevUpload(APIView):

    def dev_upload(self, data):
        saved_amount = 0
        error_amount = 0
        error_list = []
        saved_list = []
        results = {'saves': 0, 'errors': 0, 'error_reasons': [], 'save_list': []}
        for content in data:
            save_content = ContentsSerializers(data=content)
            if save_content.is_valid():
                saved_amount += 1
                save_content.save()
                saved_list.append(save_content.data)
            else:
                error_amount += 1
                error_reason = {'content': content, 'error': save_content.errors}
                error_list.append(error_reason)
        results['saves'] = saved_amount
        results['errors'] = error_amount
        results['error_reasons'] = error_list
        results['save_list'] = saved_list
        return results

    def post(self, request, dev_code):
        if dev_code == 'CREATE DEV CODE FOR ACCESS':
            data = JSONParser().parse(request)
            saves = self.dev_upload(data)
            return JsonResponse(saves, status=200)
        return Response(status=400)

    def delete(self, request, dev_code):
        if dev_code == 'CREATE DEV CODE FOR ACCESS':
            all_contents = Contents.objects.all()
            all_contents.delete()
            return Response(status=200)
        return Response(status=400)

    def get(self, request, dev_code):
        if dev_code == 'CREATE DEV CODE FOR ACCESS':
            all_contents_count = Contents.objects.all()
            youtube_contents_count = Contents.objects.all().filter(search_type='video')
            web_contents_count = Contents.objects.all().filter(search_type='web')
            image_contents_count = Contents.objects.all().filter(search_type='image')

            return JsonResponse(
                {'total': len(all_contents_count), 'video': len(youtube_contents_count),
                 'web': len(web_contents_count), 'image': len(image_contents_count)
                 }
            )
        return Response(status=400)


class UserManagement(APIView):

    def user_login(self, login_data):
        try:
            user = Users.objects.get(username=login_data['username'])
            user_serial = UsersSerializers(user)
        except:
            user = None
            user_serial = None

        password = None
        reset_password = False
        if user is not None:
            password = user_serial.data['password']
            password_check = password.split('temp password:')
            if len(password_check) > 1:
                password = password_check[1]
                reset_password = True

        if user is None:
            return None, 301
        elif password == login_data['password']:
            user_data = user_serial.data
            token = Token.objects.get(user=user).key
            split_interests = []
            if user_data['interests']:
                split_interests = user_data['interests'].split(',')
            interests = []

            for data in split_interests:
                interests_item = data.strip()
                interests.append(interests_item)

            login_user_data = {
                'email': user_data['email'],
                'interests': interests,
                'password': password,
                'token': token,
                'reset': reset_password
            }
            return login_user_data, 200
        else:
            return None, 300


    def new_user(self, data):
        username = data['username'].strip()
        password = data['password'].strip()
        interests = data['interests'].strip()
        email = username

        new_user_data = {
            'username': username,
            'password': password,
            'email': email,
            'interests': interests,
            'is_active': True
        }

        serializer = UsersSerializers(data=new_user_data)
        if serializer.is_valid():
            user_account = serializer.save()
            code = IdentificationGenerator().generate()
            EmailVerify().send_email_new_verification(username, code)
            token = Token.objects.get(user=user_account).key

            new_user_data = {'password': user_account.password, 'email': user_account.email,
                             'interests': interests, 'token': token}
            return new_user_data, 200
        else:
            print(serializer.errors)
            return None, 300

    def new_superuser(self, data):
        username = data['username']
        password = data['password']
        email = data['username']

        if data['username'].endswith(' '):
            username = data['username'].replace(' ', '')
        if data['password'].endswith(' '):
            password = data['password'].replace(' ', '')

        new_user_data = {
            'username': username,
            'password': password,
            'email': email,
            'is_superuser': True,
            'is_staff': True,
            'is_active': True
        }

        serializer = UsersSerializers(data=new_user_data)
        if serializer.is_valid():
            user_account = serializer.save()
            token = Token.objects.get(user=user_account).key

            new_user_data = {'password': user_account.password, 'email': user_account.email,
                             'interests': user_account.interests, 'token': token}
            return new_user_data, 200
        else:
            print(serializer.errors)
            return None, 300

    def post(self, request, user_status):
        data = JSONParser().parse(request)
        returned_data = (None, 400)
        if user_status == 'new_user':
            returned_data = self.new_user(data)
        elif user_status == 'returning_user':
            returned_data = self.user_login(data)
        elif user_status == 'new_superuser':
            returned_data = self.new_superuser(data)

        if returned_data[1] == 200:
            return JsonResponse(returned_data[0], status=200)
        else:
            return Response(status=returned_data[1])

    def get(self, request, dev_code):
        users_found = []
        users = Users.objects.all()
        if dev_code == 'CREATE DEV CODE FOR ACCESS':
            for all_users in users:
                user = {
                    'id': all_users.pk,
                    'email': all_users.email,
                    'password': all_users.password,
                    'active': all_users.is_active,
                    'super': all_users.is_superuser,
                    'staff': all_users.is_staff
                }
                users_found.append(user)
        else:
            users_serial = UsersSerializers(users, many=True)
            for user in users_serial.data:
                users_found.append(user)
        return JsonResponse({'users': users_found}, status=200)

    def delete(self, request, user_status):
        users = Users.objects.get(pk=request.user.id)
        users.delete()
        return Response(status=200)


class PasswordReset(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def pull_user_data(self, user):
        _user = Users.objects.get(pk=user)
        user_serial = UsersSerializers(_user)

        user_data = user_serial.data
        password = user_data['password']
        token = Token.objects.get(user=user).key

        interests = []
        if user_data['interests']:
            interests = user_data['interests'].split(',')

        login_user_data = {
            'email': user_data['email'],
            'interests': interests,
            'password': password,
            'token': token,
        }
        return login_user_data

    def post(self, request):
        user_id = request.user.id
        password = JSONParser().parse(request)
        user = Users.objects.get(pk=user_id)
        user.password = password
        user.save()
        updated_data = self.pull_user_data(user_id)
        return JsonResponse({'user': updated_data}, status=200)


class EmailPasswordReset(APIView):

    def temporary_password(self, data):
        try:
            user_check = Users.objects.get(email=data)
        except:
            user_check = None
        if user_check:
            temp_password = IdentificationGenerator().temp_password_generate()
            temp = f'temp password:{temp_password}'
            user_check.password = temp
            user_check.save()
            PasswordResetEmail().send_email(temp_password, data)
            return temp_password
        return

    def password_reset(self, email, password):
        try:
            user_check = Users.objects.get(email=email)
        except:
            user_check = None
        if user_check:
            user_check.password = password
            user_check.save()
            return {'password', password}
        return

    def post(self, request, request_type):
        data = JSONParser().parse(request)
        if request_type == 'temporary':
            temp_password = self.temporary_password(data)
            if temp_password:
                return JsonResponse({'password': temp_password})
            return JsonResponse({'message': 'Please check email'})
        elif request_type == 'change':
            password_result = self.password_reset(data['email'], data['password'])
            return password_result
        return Response(status=300)


class VerificationProcess(APIView):

    def email_verification(self, email):
        code = IdentificationGenerator().generate()
        EmailVerify().send_email_new_verification(email, code)
        return code

    def post(self, request):
        data = JSONParser().parse(request)
        email = data['email']
        try:
            user = Users.objects.get(username=email)
        except:
            user = None

        if user:
            return JsonResponse({'result': 'Email already exists'}, status=202)
        else:
            code = self.email_verification(email)
            return JsonResponse({'code': code}, status=200)


class UserInterests(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = Users.objects.get(pk=request.user.id)
        user_interests = user_data.interests
        if user_interests is not None:
            user_interests = user_interests.split(',')
        return JsonResponse({'interests': user_interests})

    def post(self, request, action):
        data = JSONParser().parse(request)
        data = data.strip().lower()
        _check_keyword = keyword_checker.check_keyword(data)
        if _check_keyword == 'forbidden':
            return JsonResponse({'BoredMessage': FORBIDDEN_KEYWORD_MESSAGE}, status=200)
        elif _check_keyword == 'alerting':
            return JsonResponse({'BoredMessage': Alerting_KEYWORD_MESSAGE}, status=200)
        else:
            user = Users.objects.get(pk=request.user.id)
            if user.interests:
                interest_list = user.interests.split(',')
            else:
                interest_list = []
            if action == 'add':
                if '' in interest_list:
                    interest_list.remove('')
                interest_list.append(data.lower())
            elif action == 'remove':
                try:
                    interest_list.remove(data)
                except:
                    pass
            new_list = ','.join(interest_list) if len(interest_list) > 1 else ''.join(interest_list)
            user.interests = new_list
            user.save()
            # return Response(status=200)
            return JsonResponse({'res': user.interests})

    def delete(self, request):
        user_data = Users.objects.get(pk=request.user.id)
        user_data.interests = ''
        user_data.save()
        return Response(status=200)


class BoredSearchFeed(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def search_settings(self, setting):
        safe = False
        if 'safe' in setting:
            setting.remove('safe')
            safe = True
        settings = {'searches': setting, 'safe': safe}
        return settings

    def bored_filter(self, user):
        viewed_list = []
        already_viewed = ViewedContents.objects.filter(user=user)
        already_viewed_serial = ViewedContentsSerializers(already_viewed, many=True)
        for viewed in already_viewed_serial.data:
            viewed_list.append(viewed['content_id'])
        return viewed_list

    def register_view(self, contents, user):
        prev_check = ViewedContents.objects.filter(user=user)
        prev_check_serial = ViewedContentsSerializers(prev_check, many=True)
        prev_list = []
        for prev in prev_check_serial.data:
            prev_list.append(prev['content_id'])
        for content in contents:
            if content['id'] in prev_list:
                pass
            else:
                view = ViewedContentsSerializers(data={'user': user, 'content_id': content['id']})
                if view.is_valid():
                    view.save()

    def get_my_interests(self, user):
        user = Users.objects.get(pk=user)
        _interests = user.interests.split(',')
        return _interests

    def content_gathering(self, **content_params):
        exclusion = content_params['exclusion']
        interests = content_params['interests']
        search_type = content_params['search_type']
        result_amount = content_params['result_amount']
        safe = content_params['safe']

        found_contents = []

        if interests == 'random':
            if safe is True:
                contents = Contents.objects.all().filter(search_type__in=search_type).filter(is_safe=safe).exclude(
                    id__in=exclusion).order_by("?")
            else:
                contents = Contents.objects.all().filter(search_type__in=search_type).exclude(
                    id__in=exclusion).order_by("?")
            contents_serial = ContentsSerializers(contents, many=True)
            requested_contents = contents_serial.data[0:result_amount]
        else:
            for interest in interests:
                if safe is True:
                    contents = Contents.objects.all().filter(topics__contains=interest).filter(
                            search_type__in=search_type).filter(is_safe=True).exclude(id__in=exclusion).order_by("?")
                else:
                    contents = Contents.objects.all().filter(topics__contains=interest).filter(
                        search_type__in=search_type).exclude(id__in=exclusion).order_by("?")
                contents_serial = ContentsSerializers(contents, many=True)
                for content in contents_serial.data:
                    if content not in found_contents:
                        found_contents.append(content)
            requested_contents = found_contents[0:result_amount]
        
        return requested_contents


    def main_bored(self, user_id, result_amount, search_types, interests):
        # add topic param and update user topics once just in case
        count = 0
        limit = [4, 8, 12]
        display_contents = []
        user = Users.objects.get(pk=user_id)
        requested_types = self.search_settings(search_types)
        if user.is_active is True:
            exclusion = self.bored_filter(user_id)
            requested_contents = self.content_gathering(exclusion=exclusion, interests=interests, search_type=requested_types['searches'],
                                   result_amount=result_amount, safe=requested_types['safe'])
            for content in requested_contents:
                data = {
                    'id': content['id'],
                    'title': content['title'],
                    'snippet': content['snippet'],
                    'topics': content['main_keyword'].upper(),
                    'search_type': content['search_type'],
                    'posted_by': content['posted_by'],
                    'link': content['link'],
                    'source': content['source'],
                    'aspect_ratio': content['aspect_ratio'],
                    'thumbnail': content['thumbnail'],
                    'removed': exclusion
                }
                
                if count in limit:
                    display_contents.append({"id": f"AD{count}", "search_type": "AD"})
                display_contents.append(data)
                count += 1
            if len(display_contents) == 0:
                display_contents.append({'id': 'empty', "BoredMessage": "Looks like that's it for today, check back"
                                                                        " tomorrow for new content!"})
            return display_contents
        else:
            return JsonResponse({'id': 'inactive'})

    def get(self, request, result_amount, search_types, interests='random'):
        search_list = search_types.split('_')
        if interests != 'random':
            interests = interests.split("_")
        display_contents = self.main_bored(request.user.id, result_amount, search_list, interests)
        if display_contents is not None:
            return JsonResponse({'contents': display_contents, 'amount': result_amount}, status=200)
        return Response(status=400)


class Searches(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def search_settings(self, setting):
        safe = False
        if 'safe' in setting:
            setting.remove('safe')
            safe = True
        settings = {'searches': setting, 'safe': safe}
        return settings

    def process_data(self, serial_data):
        contents = []
        count = 0
        ad_count = 0
        for content in serial_data:
            data = {
                'id': content['id'],
                'title': content['title'],
                'snippet': content['snippet'],
                'topics': content['main_keyword'].upper(),
                'search_type': content['search_type'],
                'posted_by': content['posted_by'],
                'link': content['link'],
                'source': content['source'],
                'aspect_ratio': content['aspect_ratio'],
                'thumbnail': content['thumbnail'],
                'is_safe': content['is_safe']
            }
            if count == 5:
                count = 0
                contents.append({"id": f"AD{ad_count}", "search_type": "AD"})
                ad_count += 1
            count += 1
            contents.append(data)
        if len(contents) == 0:
            contents.append({'id': 'empty'})
        return contents

    def safe_searches(self, search_type, keyword, start, end):
        if search_type == 'all':
            if keyword == 'random':
                contents = Contents.objects.all().filter(is_safe=True).order_by('-id')[start:end]
            else:
                contents = Contents.objects.filter(topics__icontains=keyword).filter(is_safe=True).order_by('-id')[start:end]
        else:
            if keyword == 'random':
                contents = Contents.objects.all().filter(search_type=search_type).filter(is_safe=True).order_by('-id')[start:end]
            else:
                contents = Contents.objects.filter(search_type=search_type).filter(is_safe=True).filter(
                    topics__icontains=keyword).order_by('-id')[start:end]
        return contents

    def get(self, request, keyword, search_type, direction, pg, safe):
        start = pg
        end = pg + 15
        _check_keyword = keyword_checker.check_keyword(keyword)
        if _check_keyword == 'good':
            if safe == 'True':
                contents = self.safe_searches(search_type, keyword, start, end)
            else:
                if search_type == 'all':
                    if keyword == 'random':
                        #
                        contents = Contents.objects.all().order_by('-id')[start:end]
                    else:
                        contents = Contents.objects.filter(topics__icontains=keyword).order_by('-id')[start:end]
                else:
                    if keyword == 'random':
                        contents = Contents.objects.all().filter(search_type=search_type).order_by('-id')[start:end]
                    else:
                        contents = Contents.objects.filter(search_type=search_type).filter(
                            topics__icontains=keyword).order_by('-id')[start:end]
            contents_serial = ContentsSerializers(contents, many=True)
            search_results = self.process_data(contents_serial.data)
            actual_content_count = pg
            if len(search_results) < 15:
                pg = 'end'
            return JsonResponse({'data': search_results, 'page': pg, 'count': actual_content_count}, status=200)
        elif _check_keyword == 'forbidden':
            return JsonResponse({'BoredMessage': FORBIDDEN_KEYWORD_MESSAGE}, status=200)
        elif _check_keyword == 'alerting':
            return JsonResponse({'BoredMessage': Alerting_KEYWORD_MESSAGE}, status=200)


class Favorites(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def pull_contents(self, ids):
        contents = Contents.objects.filter(pk__in=ids)
        contents_serial = ContentsSerializers(contents, many=True)
        return contents_serial.data

    def favorited_contents(self, user, folder):
        favorites_list = []
        folders = Folders.objects.filter(user=user)
        folders_serial = FoldersSerializers(folders, many=True)
        for favorite_folder in json.loads(folders_serial.data[0]['folders']):
            if favorite_folder['name'] == folder:
                favorites_list = favorite_folder['contents']
                ### need to add code to pull contents based off list
        return self.pull_contents(favorites_list)


    def updated_favs(self, user, update_type, folder=None):
        if update_type == 'folder':
            updated_folder = self.pull_folders(user)
            return updated_folder
        elif update_type == 'content':
            favorites_list = self.favorited_contents(user, folder)
            return favorites_list

    def pull_folders(self, user):
        all_my_folders = []
        folder_id = 0
        my_folders = Folders.objects.filter(user=user)
        my_folders_serial = FoldersSerializers(my_folders, many=True)
        if len(my_folders_serial.data) > 0:
            folders = json.loads(my_folders_serial.data[0]['folders'])
            for folder in folders:
                folder_id += 1
                all_my_folders.append({
                    'folderId': folder_id,
                    'folder': folder['name'],
                    'favoritesCount': len(folder['contents']),
                    'contents': folder['contents']
                })
        return all_my_folders

    def get(self, request, request_type, folder_name=None):
        if request_type == 'folder':
            fav_folders = self.pull_folders(request.user.id)
            return JsonResponse({'favorites': fav_folders}, status=200)
        elif request_type == 'favs':
            favorites_list = self.favorited_contents(request.user.id, folder_name)
            return JsonResponse({'favorites': favorites_list}, status=200)


    def create_new_folder(self, user, folder_name):
        folder_data = {'user': user, 'folders': json.dumps([{'name': folder_name, 'contents': []}])}
        folder_serial = FoldersSerializers(data=folder_data)
        if folder_serial.is_valid():
            folder_serial.save()
            return 'Saved'
        return folder_serial.errors



    def add_new_folder(self, user, folder_name):
        current_list_of_folders = []
        user_folders = Folders.objects.get(user=user)
        user_folders_serial = FoldersSerializers(user_folders).data
        current_folders = json.loads(user_folders_serial['folders'])
        for cur_folder in current_folders:
            current_list_of_folders.append(cur_folder['name'])
        if folder_name not in current_list_of_folders:
            current_folders.append({'name': folder_name, 'contents': []})
            user_folders.folders = json.dumps(current_folders)
            user_folders.save()


    def get_folder_data(self, user, folder_name):
        try:
            user_folders = Folders.objects.get(user=user)
        except:
            self.add_new_folder(user, folder_name)
            user_folders = Folders.objects.get(user=user)
        folder_result = FoldersSerializers(user_folders).data
        folder_result = json.loads(folder_result['folders'])
        all_folders = []
        for folder in folder_result:
            all_folders.append(folder['name'])
        if folder_name not in all_folders:
            self.add_new_folder(user, folder_name)
            user_folders = Folders.objects.get(user=user)
            folder_result = FoldersSerializers(user_folders).data
            folder_result = json.loads(folder_result['folders'])
        return folder_result

    def save_favorites(self, user, updated_favorites):
        user_folders = Folders.objects.get(user=user)
        user_folders.folders = json.dumps(updated_favorites)
        user_folders.save()

    def add_favorite(self, user, folder_name, content_id):
        folder_data = self.get_folder_data(user, folder_name)
        for folder in folder_data:
            if folder['name'] == folder_name:
                if content_id not in folder['contents']:
                    folder['contents'].append(content_id)
        self.save_favorites(user, folder_data)
        folder_data = self.pull_folders(user)
        return folder_data


    def post(self, request, request_type, folder_name, content_id):
        if request_type == 'newfolder':
            try:
                self.add_new_folder(request.user.id, folder_name)
                updated_folder = self.pull_folders(request.user.id)
                return JsonResponse({'result': updated_folder})
            except:
                created_result = self.create_new_folder(request.user.id, folder_name)
                if created_result == 'Saved':
                    updated_folder = self.pull_folders(request.user.id)
                    return JsonResponse({'result': updated_folder})
                return JsonResponse({'reason': created_result})
        else:
            new_favorites = self.add_favorite(request.user.id, folder_name, content_id)
            return JsonResponse({'result': new_favorites})


    def delete(self, request, request_type, folder_name, content_id):
        if request_type == 'folder':
            folders = Folders.objects.get(user=request.user.id)
            folders_serial = FoldersSerializers(folders)
            current_folders = json.loads(folders_serial.data['folders'])
            for favorite_folder in current_folders:
                if favorite_folder['name'] == folder_name:
                    delete_folder = current_folders.index(favorite_folder)
                    del current_folders[delete_folder]
                    current_folders = json.dumps(current_folders)
                    folders.folders = current_folders
                    folders.save()
            updated_folder = self.updated_favs(request.user.id, 'folder')
            return JsonResponse({'result': updated_folder})

        elif request_type == 'content':
            folders = Folders.objects.get(user=request.user.id)
            folders_serial = FoldersSerializers(folders)
            current_folders = json.loads(folders_serial.data['folders'])
            for favorite_folder in current_folders:
                if favorite_folder['name'] == folder_name:
                    try:
                        favorite_folder['contents'].remove(content_id)
                        current_folders = json.dumps(current_folders)
                        folders.folders = current_folders
                        folders.save()
                    except:
                        pass
            updated_folder = self.updated_favs(request.user.id, 'content', folder_name)
            return JsonResponse(
                {'result': updated_folder, 'updatedFolders': self.updated_favs(request.user.id, 'folder')})

        elif request_type == 'all':
            my_folders = Folders.objects.filter(user=request.user.id)
            try:
                my_folders.delete()
            except:
                pass
            updated_folder = self.updated_favs(request.user.id, 'folder')
            return JsonResponse({'result': updated_folder})


class Views(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        viewed_list = []
        already_viewed = ViewedContents.objects.filter(user=request.user.id)
        already_viewed_serial = ViewedContentsSerializers(already_viewed, many=True)
        for viewed in already_viewed_serial.data:
            viewed_list.append(viewed['content_id'])
        return JsonResponse({'result': viewed_list}, status=200)

    def delete(self, request):
        already_viewed = ViewedContents.objects.filter(user=request.user.id)
        already_viewed.delete()
        return Response(status=200)
