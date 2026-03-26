from collections import Counter
from datetime import date

from django.db.models import Count

from .models import Athlete, TrendEntry


STATUS_STYLES = {
    "Cleared": {"label": "Cleared", "color": "#33c184"},
    "Pending": {"label": "Pending", "color": "#f2c94c"},
    "Restricted": {"label": "Restricted", "color": "#f1555b"},
}


def _build_status_counts(athletes):
    counter = Counter(entry["status"] for entry in athletes.values_list("status", flat=True))
    total = athletes.count()
    return {status: counter.get(status, 0) for status in STATUS_STYLES.keys()}, total


def get_dashboard_payload():
    athletes = Athlete.objects.all()
    status_counts, total = _build_status_counts(athletes)

    overview = [
        {"label": "Total Athletes", "value": total, "icon": "users"},
        {"label": "Cleared", "value": status_counts.get("Cleared", 0), "icon": "check_circle"},
        {"label": "Pending", "value": status_counts.get("Pending", 0), "icon": "pending"},
        {"label": "Restricted", "value": status_counts.get("Restricted", 0), "icon": "block"},
        {"label": "Avg Fitness", "value": 0, "icon": "trending_up"},
    ]

    trend_entries = TrendEntry.objects.all()
    trend_graph = [
        {"month": entry.month, "average_fitness": entry.average_fitness}
        for entry in trend_entries
    ]

    sport_totals = (
        athletes.values("sport")
        .annotate(count=Count("id"))
        .order_by("sport")
    )

    athlete_rows = [
        {
            "name": athlete.name,
            "sport": athlete.sport,
            "class": athlete.class_level,
            "fitness_score": athlete.fitness_score,
            "status": STATUS_STYLES.get(athlete.status, {"label": athlete.status, "color": "#888"}),
        }
        for athlete in athletes
    ]

    # Safeguard against division by zero when computing averages
    average_score = (
        round(sum(a["fitness_score"] for a in athlete_rows) / total) if total else 0
    )
    overview[-1]["value"] = average_score

    return {
        "overview": overview,
        "trend_graph": trend_graph,
        "sport_totals": list(sport_totals),
        "athletes": athlete_rows,
        "generated": date.today().isoformat(),
    }