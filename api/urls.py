from django.urls import path
from .views import roomView, createRoomView, getRoom, joinRoom, UserInRoom, LeaveRoom, UpdateRoom

urlpatterns = [
    path('room', roomView.as_view()),
    path('create-room', createRoomView.as_view()),
    path('get-room', getRoom.as_view()),
    path('join-room', joinRoom.as_view()),
    path('user-in-room', UserInRoom.as_view()),
    path('leave-room', LeaveRoom.as_view()),
    path('update-room', UpdateRoom.as_view()),

]