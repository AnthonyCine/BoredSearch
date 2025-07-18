from django.urls import path
from.views import home_page, privacy, dev_login, dev_feed, app_ads_txt, about, user_verification, delete_account

urlpatterns = [
    path('app-ads.txt/', app_ads_txt),
    path('mobile/boredsearch/privacy_page/', privacy),
    path('privacy_page/', privacy),
    path('about/', about),
    path('verification/<mode>/<token>/<user_id>/', user_verification),
    path('verification/resend/<mode>/<token>/<user_id>/', user_verification),
    path('deleteaccount/', delete_account)
    # path('user_login/', dev_login),
    # path('bored/', dev_feed),
]