
from decimal import Decimal, ROUND_DOWN

from django.db import transaction

from users.models import UserProfile, ReferralLevel
from wallet.models import WalletTransaction
from investments.models import DailyROI


def credit_level_roi(daily_roi_id):
    """
    Credit eligible ancestors for one DailyROI record.
    Safe to retry: unique wallet references prevent duplicates.
    """

    with transaction.atomic():
        daily_roi = (
            DailyROI.objects
            .select_related("investment__user")
            .select_for_update()
            .get(id=daily_roi_id)
        )

        user = daily_roi.investment.user

        profile = UserProfile.objects.select_related(
            "referred_by"
        ).get(user=user)

        ancestor = profile.referred_by
        credited = 0

        for level in range(1, 8):
            if ancestor is None:
                break

            config = ReferralLevel.objects.filter(
                level=level
            ).first()

            if config and config.percentage is not None:
                # Enforce the specification's minimum referrals.
                direct_count = UserProfile.objects.filter(
                    referred_by=ancestor
                ).count()

                if (
                    direct_count >= level
                    and Decimal("0") <= config.percentage <= Decimal("100")
                ):
                    amount = (
                        Decimal(daily_roi.amount_paise)
                        * config.percentage
                        / Decimal("100")
                    )

                    amount_paise = int(
                        amount.to_integral_value(
                            rounding=ROUND_DOWN
                        )
                    )

                    if amount_paise > 0:
                        reference = (
                            f"level_roi_{daily_roi.id}_{level}"
                        )

                        _, created = (
                            WalletTransaction.objects.get_or_create(
                                reference=reference,
                                defaults={
                                    "user_id": ancestor.user_id,
                                    "transaction_type": "level_roi",
                                    "amount_paise": amount_paise,
                                },
                            )
                        )

                        if created:
                            credited += 1

            ancestor = ancestor.referred_by

        return credited
