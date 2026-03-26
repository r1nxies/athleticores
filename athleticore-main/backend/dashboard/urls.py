from django.urls import path

from .views import dashboard_data, login_view, logout_view, register_view

urlpatterns = [
    path("dashboard/", dashboard_data, name="dashboard_data"),
    path("auth/login/", login_view, name="login"),
    path("auth/logout/", logout_view, name="logout"),
    path("auth/register/", register_view, name="register"),
]
