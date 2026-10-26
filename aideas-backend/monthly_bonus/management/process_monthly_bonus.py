
from datetime import date

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from monthly_bonus.services import (
    get_previous_month,
    distribute_monthly_bonus,
)


class Command(BaseCommand):
    help = "Credit monthly revenue share to eligible users"

    def add_arguments(self, parser):
        parser.add_argument(
            "--month",
            type=str,
            help="Bonus month in YYYY-MM format (default: previous month)",
        )

    def handle(self, *args, **options):
        month_input = options.get("month")

        if month_input:
            try:
                month = date.fromisoformat(f"{month_input}-01")
            except ValueError:
                raise CommandError("Invalid month. Use YYYY-MM.")
        else:
            month = get_previous_month()

        current_month = timezone.localdate().replace(day=1)

        if month >= current_month:
            raise CommandError(
                "Only completed months can be processed."
            )

        credited_count = distribute_monthly_bonus(month)

        self.stdout.write(
            self.style.SUCCESS(
                f"Monthly bonus processed for {month:%B %Y}. "
                f"Users credited: {credited_count}"
            )
        )
