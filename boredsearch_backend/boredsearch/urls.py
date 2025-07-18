from django.urls import path
from.views import Favorites, UserInterests, UserManagement, PasswordReset, VerificationProcess, BoredSearchFeed, \
    Searches, DevUpload, Views, ContentEdits, EmailPasswordReset, get_home

urlpatterns = [
    path('home/', get_home),
    path('dev/<dev_code>/', DevUpload.as_view()),
    path('edit/delete/<int:pk>/<all>/', ContentEdits.as_view()),
    path('edit/edit/<int:pk>/<editing>/', ContentEdits.as_view()),
    path('edit/pull/<sort>/', ContentEdits.as_view()),
    #
    path('users/dev/<dev_code>/', UserManagement.as_view()),
    path('users/<user_status>/', UserManagement.as_view()),
    path('change_password/', PasswordReset.as_view()),
    path('reset_password/email_verification/<request_type>/', EmailPasswordReset.as_view()),
    path('interests/<action>/', UserInterests.as_view()),
    path('interests/', UserInterests.as_view()),
    path('main_bored/<int:result_amount>/<search_types>/<interests>/', BoredSearchFeed.as_view()), ##add topics to pull
    path('search/<keyword>/<search_type>/<direction>/<int:pg>/<safe>/', Searches.as_view()),
    path('verify/new/account/', VerificationProcess.as_view()),
    #
    path('favorites/<request_type>/<folder_name>/', Favorites.as_view()), #get request
    path('favorites/<request_type>/<folder_name>/<int:content_id>/', Favorites.as_view()), # post and delete request
    #
    path('views/', Views.as_view()),

]
