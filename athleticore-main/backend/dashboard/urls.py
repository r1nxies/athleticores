from django.urls import path

from .views import create_athlete_view, dashboard_data, login_view, logout_view, register_view, session_view

urlpatterns = [
    path("dashboard/", dashboard_data, name="dashboard_data"),
    path("auth/login/", login_view, name="login"),
    path("auth/logout/", logout_view, name="logout"),
    path("auth/register/", register_view, name="register"),
    path("auth/session/", session_view, name="session"),
    path("admin/athletes/", create_athlete_view, name="create_athlete"),
]
