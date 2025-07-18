from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.decorators import api_view
from .webpages import SUCESSFULL_VERIFICATION_WEBPAGE, FAILED_VERIFICATION_WEBPAGE, INVALID_ACCOUNT_WEBPAGE
from pathlib import Path
import os
import requests

##### Run Test on all views all updats have been deployed
BASE_DIR = Path(__file__).resolve().parent.parent


def app_ads_txt(request):
    ad_file = open(os.path.join(BASE_DIR, 'static', 'app-ads.txt'), 'r')
    file_content = ad_file.read()
    ad_file.close()
    return HttpResponse(file_content, content_type="text/plain")


def home_page(request):
    return render(request, 'boredsearch/home.html')


def privacy(request):
    return render(request, 'boredsearch/privacy.html')


def about(request):
    return render(request, 'boredsearch/about.html')

@api_view(['GET'])
def delete_account(request):
    return Response(status=200)


@api_view(['GET'])
def user_verification(request, mode, token, user_id):
    # add new or resend
    user_verify = requests.get(f"https://app-boredsearch-mobile.com/verify/{mode}/{token}/{user_id}/")
    if user_verify.json()['verification_status'] == 200 or user_verify.json()['verification_status'] == 105:
        return HttpResponse(SUCESSFULL_VERIFICATION_WEBPAGE)
    elif user_verify.json()['verification_status'] == 103:
        return HttpResponse(INVALID_ACCOUNT_WEBPAGE)
    else:
        return HttpResponse(FAILED_VERIFICATION_WEBPAGE)


@api_view(['POST'])
def dev_login(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        dev_username = data['username']
        dev_password = data['password']
        if dev_username == 'admin@boredsearch.com' and dev_password == 'boredadminpassword':
            dev_login_data = {
                'email': 'admin@boredsearch.com',
                'password': 'boredadminpassword',
                'search_settings': ['Images', 'Videos', 'Sites', 'Safe Search'],
                'token': 'dev_temp_token',
                'interests': ['python', 'javascript'],
                'result_settings': 5

            }
            return JsonResponse({'user_login': dev_login_data}, status=200)
        return Response(status=400)
    return Response(status=400)


def dev_feed(request):
    return JsonResponse(
        {'contents': [
            {
                'id': 0,
                'title': 'Built-in Types — Python 3.11.1 documentation',
                'link': 'https://docs.python.org/3/library/stdtypes.html',
                'topics': 'PYTHON',
                'search_type': 'web',
                'snippet': "Two methods support conversion to and from hexadecimal strings. Since Python's floats are stored internally as binary numbers, converting a float to or from a\xa0...",
                'source': 'docs.python.org',
                'posted_by': 'python',
                'thumbnail': 'https://docs.python.org/3/_static/og-image.png',
                'aspect_ratio': 1.0
            },
            {
                'id': 2,
                'title': 'Galaxy S23 / Ultra Impressions: Cruise Control!',
                'link': 'https://www.youtube.com/watch?v=9kxTOxDGLqs',
                'topics': 'TECH',
                'search_type': 'video',
                'snippet': "Samsung's flagships for 2023 are a small bump up with new chips and new cameras. If it ain't broke... AnkerAce 45W: Amazon: ...",
                'source': 'YouTube',
                'posted_by': 'Marques Brownlee',
                'aspect_ratio': 0.75,
                'thumbnail': 'https://i.ytimg.com/vi/9kxTOxDGLqs/hqdefault.jpg',
            },
            {
                "id": "AD0",
                "search_type": "AD"
            },
            {
                'id': 3,
                'title': 'Tech Data Corporation',
                'link': 'https://www.techdata.com/',
                'topics': 'TECH',
                'search_type': 'web',
                'snippet': 'Global distributor of technology products, services and solutions.',
                'source': 'www.techdata.com',
                'posted_by': 'techdata'
            },
            {
                'id': 4,
                'thumbnail': 'https://64.media.tumblr.com/dce92ecfa1ec49a0a0bfa8516abbe020/tumblr_nwug7l4mxQ1r6g9m4o1_400.gif',
                'aspect_ratio': 0.5633333333333334,
                'source': 'tumblr',
                'topics': 'TATTOO',
                'posted_by': 'zerostatereflex',
                'link': 'https://zerostatereflex.tumblr.com/post/131969202569/ink-mapping-video-mapping-projection-on-tattoos',
                'search_type': 'image'
            },
            {
                'id': 5,
                'snippet': '*The floppy-disk and CD-ROM multimedia revolution! Published on May 13, 2015 http://www.imal.org/en/activity/welco... Welcome to...',
                'thumbnail': 'https://i.ytimg.com/vi/7xKmmceto4k/hqdefault.jpg', 'aspect_ratio': 0.75,
                'source': 'tumblr',
                'topics': 'DEAD MEDIA',
                'posted_by': 'brucesterling',
                'link': 'https://brucesterling.tumblr.com/post/132089749623/the-floppy-disk-and-cd-rom-multimedia-revolution',
                'search_type': 'video'
            },
            {
                "id": "AD1",
                "search_type": "AD"
            },
            {
                'id': 6,
                'title': '',
                'type': 'text',
                'snippet': 'A fool always finds a greater fool to admire him.',
                'source': 'tumblr',
                'topics': 'QUOTES',
                'posted_by': 'seyidlifeelings',
                'link': 'https://www.tumblr.com/blog/view/seyidlifeelings/708181237764915200',
                'search_type': 'text'
            },
            {
                'id': 7,
                'title': '',
                'snippet': '#Active Shoes\n\nChristophe Guberan, Carlo Clopath and Skylar Tibbits from the Self-Assembly Lab at MIT look into active,...',
                'thumbnail': 'https://i.vimeocdn.com/video/541798249-bcb2104e3237fae85055ef1d801dd950a66a75376e42b3a87d9039d8b3e51fda-d_295x166',
                'aspect_ratio': 0.5627118644067797,
                'source': 'tumblr',
                'topics': 'FUTURE',
                'posted_by': 'futurescope',
                'link': 'https://futurescope.tumblr.com/post/132478992104/active-shoes-christophe-guberan-carlo-clopath',
                'search_type': 'video'
            },
            {
                'id': 8,
                'title': 'Vertical',
                'snippet': 'Mount Kimbie - Vertical',
                'thumbnail': 'https://i.scdn.co/image/ab67616d0000b273fe6df99aba945aeca7dfaa53',
                'source': 'tumblr',
                'topics': 'AUDIO',
                'posted_by': 'grandsword',
                'link': 'https://grandsword.tumblr.com/post/708177726979309568/mount-kimbie-vertical',
                'search_type': 'audio'
            },
        ]}
    )
