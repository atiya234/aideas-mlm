
from zoneinfo import ZoneInfo

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management import call_command
from django.core.management.base import BaseCommand


IST = ZoneInfo("Asia/Kolkata")


class Command(BaseCommand):
    help = "Run Daily ROI and Monthly Bonus scheduler"

    def handle(self, *args, **options):
        scheduler = BlockingScheduler(timezone=IST)

        scheduler.add_job(
            lambda: call_command("process_roi"),
            CronTrigger(
                hour=1,
                minute=0,
                timezone=IST
            ),
            id="daily_roi",
            max_instances=1,
            coalesce=True,
            replace_existing=True,
        )

        scheduler.add_job(
            lambda: call_command("process_monthly_bonus"),
            CronTrigger(
                day=1,
                hour=1,
                minute=30,
                timezone=IST
            ),
            id="monthly_bonus",
            max_instances=1,
            coalesce=True,
            replace_existing=True,
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Scheduler started. Timezone: Asia/Kolkata"
            )
        )

        try:
            scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            scheduler.shutdown()
