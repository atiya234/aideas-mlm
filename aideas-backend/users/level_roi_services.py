from decimal import Decimal, ROUND_DOWN
from .models import UserProfile, ReferralLevel


def calculate_level_roi(daily_roi_paise, level_percentage):
    """
    Calculate a percentage of the originating user's daily ROI.
    All amounts are in paise


    """

    if daily_roi_paise <= 0:
        return 0
    if level_percentage is None:
        return 0
    percentage = Decimal(str(level_percentage))

    if percentage < 0 or percentage > 100:
        return 0

    amount = (
        Decimal(daily_roi_paise) * percentage / Decimal("100")

    )
    return int(
        amount.to_integral_value(rounding=ROUND_DOWN)
    )

def get_eligible_level_ancestors(user):
    """
    Return eligible ancestors for levels 1 through 7.
    A level must have an admin-configured percentage.
    """

    profile = UserProfile.objects.select_related(
        "referred_by"
    ).get(user=user) # database se referred user ka profile aur uske referrer ki info retrieve karro

    current_profile = profile.referred_by
    eligible_ancestors = [] # Eligible ancestor info store in tuese list

    for level in range(1, 8):
        if current_profile is None:
            break

        config = ReferralLevel.objects.filter(
            level=level
        ).first()

        if config and config.percentage is not None:
            direct_count = UserProfile.objects.filter(
                referred_by=current_profile
            ).count()

            if direct_count >= level:
                eligible_ancestors.append({
                    "level": level,
                    "user_id": current_profile.user_id,
                    "percentage": config.percentage,
                })

        current_profile = current_profile.referred_by

    return eligible_ancestors
