import json

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods

from .data import get_dashboard_payload
from .models import Athlete, Coach


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


@require_http_methods(["GET", "OPTIONS"])
def session_view(request):
    if request.method == "OPTIONS":
        return _cors_preflight(request)

    return _cors_response(
        request,
        {
            "authenticated": request.user.is_authenticated,
            "user": request.user.username if request.user.is_authenticated else None,
        },
    )


@csrf_exempt
@require_http_methods(["POST", "OPTIONS"])
def create_athlete_view(request):
    if request.method == "OPTIONS":
        return _cors_preflight(request)

    if not request.user.is_authenticated:
        return _cors_response(request, {"detail": "Authentication required"}, status=401)

    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return _cors_response(request, {"detail": "Invalid JSON"}, status=400)

    name = (payload.get("name") or "").strip()
    sport = (payload.get("sport") or "").strip()
    class_level = (payload.get("class_level") or "").strip()
    status = (payload.get("status") or "").strip()
    coach_name = (payload.get("coach_name") or "").strip()
    coach_email = (payload.get("coach_email") or "").strip()
    coach_experience = payload.get("coach_experience")

    if not name or not sport or not class_level or not status:
        return _cors_response(
            request,
            {"detail": "name, sport, class_level, and status are required"},
            status=400,
        )

    if status not in Athlete.ClearanceStatus.values:
        return _cors_response(request, {"detail": "Invalid status value"}, status=400)

    try:
        fitness_score = int(payload.get("fitness_score"))
    except (TypeError, ValueError):
        return _cors_response(request, {"detail": "fitness_score must be a number"}, status=400)

    if fitness_score < 0 or fitness_score > 100:
        return _cors_response(request, {"detail": "fitness_score must be between 0 and 100"}, status=400)

    coach = None
    if coach_name:
        if coach_email:
            defaults = {
                "name": coach_name,
                "sport": sport,
                "years_experience": int(coach_experience or 0),
            }
            coach, _created = Coach.objects.update_or_create(email=coach_email, defaults=defaults)
        else:
            coach = (
                Coach.objects.filter(name=coach_name, sport=sport)
                .order_by("id")
                .first()
            )
            if coach is None:
                coach = Coach.objects.create(
                    name=coach_name,
                    sport=sport,
                    email=f"{coach_name.lower().replace(' ', '.')}.{sport.lower().replace(' ', '')}@athleticore.local",
                    years_experience=int(coach_experience or 0),
                )

    athlete = Athlete.objects.create(
        name=name,
        sport=sport,
        class_level=class_level,
        fitness_score=fitness_score,
        status=status,
        coach=coach,
    )

    return _cors_response(
        request,
        {
            "status": "created",
            "athlete": {
                "id": athlete.id,
                "name": athlete.name,
                "sport": athlete.sport,
            },
        },
        status=201,
    )
