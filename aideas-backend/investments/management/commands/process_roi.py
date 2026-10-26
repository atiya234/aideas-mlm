from django.core.management.base import BaseCommand
from django.utils import timezone
from investments.models import Investment
from investments.services import process_daily_roi


class Command(BaseCommand):
    help = "Process daily ROI for approved investments"

    def handle(self , *args, **options):
        today = timezone.localdate()

        investments = Investment.objects.filter(
            order__payment_status="paid",
            order__approval_status="approved"
        )

        processed = 0

        # check each investment

        for investment in investments:
            # calculate and credit roi only if eligible
            if process_daily_roi(investment.id, today):
                processed += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Daily ROI processed for {processed} investments."
            )
        )
