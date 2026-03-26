from django.core.management.base import BaseCommand

from dashboard.models import Athlete, TrendEntry


class Command(BaseCommand):
    help = "Seed the dashboard database with initial sample data."

    def handle(self, *args, **options):
        Athlete.objects.all().delete()
        TrendEntry.objects.all().delete()

        athletes = [
            {"name": "Marcus Johnson", "sport": "Basketball", "class_level": "Junior", "fitness_score": 92, "status": Athlete.ClearanceStatus.CLEARED},
            {"name": "Sarah Williams", "sport": "Soccer", "class_level": "Senior", "fitness_score": 88, "status": Athlete.ClearanceStatus.CLEARED},
            {"name": "James Chen", "sport": "Track & Field", "class_level": "Sophomore", "fitness_score": 78, "status": Athlete.ClearanceStatus.PENDING},
            {"name": "Emily Rodriguez", "sport": "Volleyball", "class_level": "Junior", "fitness_score": 86, "status": Athlete.ClearanceStatus.CLEARED},
            {"name": "Tyler Brown", "sport": "Swimming", "class_level": "Freshman", "fitness_score": 72, "status": Athlete.ClearanceStatus.RESTRICTED},
            {"name": "Olivia Martinez", "sport": "Tennis", "class_level": "Senior", "fitness_score": 90, "status": Athlete.ClearanceStatus.CLEARED},
        ]

        TrendEntry.objects.bulk_create(
            [
                TrendEntry(month="Jan", average_fitness=76),
                TrendEntry(month="Feb", average_fitness=78),
                TrendEntry(month="Mar", average_fitness=80),
            ]
        )

        for athlete in athletes:
            Athlete.objects.create(**athlete)

        self.stdout.write(self.style.SUCCESS("Seeded dashboard database"))