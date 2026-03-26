from django.db import models


class Athlete(models.Model):
    class ClearanceStatus(models.TextChoices):
        CLEARED = "Cleared", "Cleared"
        PENDING = "Pending", "Pending"
        RESTRICTED = "Restricted", "Restricted"

    name = models.CharField(max_length=120)
    sport = models.CharField(max_length=64)
    class_level = models.CharField(max_length=32)
    fitness_score = models.PositiveSmallIntegerField()
    status = models.CharField(max_length=16, choices=ClearanceStatus.choices)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-fitness_score", "name"]

    def __str__(self):
        return f"{self.name} ({self.sport})"


class TrendEntry(models.Model):
    month = models.CharField(max_length=16)
    average_fitness = models.PositiveSmallIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.month}: {self.average_fitness}"