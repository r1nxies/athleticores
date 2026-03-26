import json

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods

from .data import get_dashboard_payload


def _apply_cors_headers(request, response):
    origin = request.headers.get("Origin")
    if origin:
        # Reflect request origin so credentialed cross-origin requests are allowed.
        response["Access-Control-Allow-Origin"] = origin
        response["Vary"] = "Origin"
    else:
        response["Access-Control-Allow-Origin"] = "*"

    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def _cors_response(request, payload, status=200):
    response = JsonResponse(payload, status=status)
    return _apply_cors_headers(request, response)


def _cors_preflight(request):
    return _apply_cors_headers(request, HttpResponse(status=204))


@require_http_methods(["GET", "OPTIONS"])
def dashboard_data(request):
    if request.method == "OPTIONS":
        return _cors_preflight(request)

    payload = get_dashboard_payload()
    return _cors_response(request, payload)


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def login_view(request):
    if request.method == "OPTIONS":
        return _cors_preflight(request)

    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return _cors_response(request, {"detail": "Invalid JSON"}, status=400)

    username = payload.get("username")
    password = payload.get("password")

    if not username or not password:
        return _cors_response(request, {"detail": "Username and password are required"}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return _cors_response(request, {"detail": "Invalid credentials"}, status=400)

    login(request, user)
    return _cors_response(request, {"status": "success"})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def logout_view(request):
    if request.method == "OPTIONS":
        return _cors_preflight(request)

    logout(request)
    return _cors_response(request, {"status": "logged_out"})


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def register_view(request):
    if request.method == "OPTIONS":
        return _cors_preflight(request)

    User = get_user_model()
    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return _cors_response(request, {"detail": "Invalid JSON"}, status=400)

    username = payload.get("username")
    password = payload.get("password")
    email = payload.get("email")

    if not username or not password:
        return _cors_response(request, {"detail": "username and password are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return _cors_response(request, {"detail": "Username already exists"}, status=400)

    user = User.objects.create_user(username=username, email=email or "", password=password)
    return _cors_response(request, {"status": "registered", "user": user.username})
