from django.core.management.base import BaseCommand

from dashboard.models import Athlete, Coach, TrendEntry


class Command(BaseCommand):
    help = "Seed the dashboard database with initial sample data."

    def handle(self, *args, **options):
        Athlete.objects.all().delete()
        Coach.objects.all().delete()
        TrendEntry.objects.all().delete()

        coaches = {
            "Basketball": Coach.objects.create(
                name="Jordan Hayes",
                sport="Basketball",
                email="jordan.hayes@athleticore.local",
                years_experience=11,
            ),
            "Soccer": Coach.objects.create(
                name="Maya Brooks",
                sport="Soccer",
                email="maya.brooks@athleticore.local",
                years_experience=9,
            ),
            "Track & Field": Coach.objects.create(
                name="Chris Bennett",
                sport="Track & Field",
                email="chris.bennett@athleticore.local",
                years_experience=13,
            ),
            "Volleyball": Coach.objects.create(
                name="Leah Morgan",
                sport="Volleyball",
                email="leah.morgan@athleticore.local",
                years_experience=8,
            ),
            "Swimming": Coach.objects.create(
                name="Aaron Patel",
                sport="Swimming",
                email="aaron.patel@athleticore.local",
                years_experience=10,
            ),
            "Tennis": Coach.objects.create(
                name="Nina Foster",
                sport="Tennis",
                email="nina.foster@athleticore.local",
                years_experience=7,
            ),
        }

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
            Athlete.objects.create(**athlete, coach=coaches.get(athlete["sport"]))

        self.stdout.write(self.style.SUCCESS("Seeded dashboard database"))