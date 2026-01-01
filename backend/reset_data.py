"""
Data reset script for Game of Life application.
This script will:
1. Delete all existing logs, rituals, and quotas
2. Seed new rituals with specified targets
3. Seed new quotas
4. Set the default starting date to January 1, 2026
"""

from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Ritual, Quota, Log, Reward, Setting

def reset_and_seed_data():
    """Reset all data and seed with new configuration"""
    
    # Create tables if they don't exist
    create_db_and_tables()
    
    with Session(engine) as session:
        # Delete all existing data
        print("Deleting all existing logs...")
        logs = session.exec(select(Log)).all()
        for log in logs:
            session.delete(log)
        
        print("Deleting all existing rituals...")
        rituals = session.exec(select(Ritual)).all()
        for ritual in rituals:
            session.delete(ritual)
        
        print("Deleting all existing quotas...")
        quotas = session.exec(select(Quota)).all()
        for quota in quotas:
            session.delete(quota)
        
        session.commit()
        print("All existing data deleted.")
        
        # Seed new rituals (all in minutes per week)
        print("\nSeeding new rituals...")
        new_rituals = [
            {"name": "Academics", "target_value": 90, "unit": "mins", "period": "weekly", "sort_order": 0, "icon": "📖"},
            {"name": "B&E", "target_value": 24, "unit": "mins", "period": "weekly", "sort_order": 1, "icon": "🔑"},
            {"name": "Business Time", "target_value": 60, "unit": "mins", "period": "weekly", "sort_order": 2, "icon": "💼"},
            {"name": "Church of Iron", "target_value": 180, "unit": "mins", "period": "weekly", "sort_order": 3, "icon": "🏋️"},
            {"name": "Create / Ars", "target_value": 90, "unit": "mins", "period": "weekly", "sort_order": 4, "icon": "🎨"},
            {"name": "DOMUS", "target_value": 240, "unit": "mins", "period": "weekly", "sort_order": 5, "icon": "🏠"},
            {"name": "FRATERNITAS", "target_value": 120, "unit": "mins", "period": "weekly", "sort_order": 6, "icon": "👥"},
            {"name": "LUDUS", "target_value": 180, "unit": "mins", "period": "weekly", "sort_order": 7, "icon": "🎮"},
            {"name": "Polyglottia", "target_value": 125, "unit": "mins", "period": "weekly", "sort_order": 8, "icon": "🗣️"},
            {"name": "Spirit / Daemon", "target_value": 60, "unit": "mins", "period": "weekly", "sort_order": 9, "icon": "🔥"},
            {"name": "Yoga / Movement", "target_value": 60, "unit": "mins", "period": "weekly", "sort_order": 10, "icon": "🧘"},
        ]
        
        for ritual_data in new_rituals:
            ritual = Ritual(**ritual_data)
            session.add(ritual)
            print(f"  Added ritual: {ritual.name} - {ritual.target_value} {ritual.unit}/{ritual.period}")
        
        # Seed new quotas (whole numbers)
        print("\nSeeding new quotas...")
        new_quotas = [
            {"name": "Alcohol", "unit": "count", "category": "vice", "icon": "🍷", "label": None, "sort_order": 0},
            {"name": "Pharmaceutical", "unit": "count", "category": "vice", "icon": "💊", "label": None, "sort_order": 1},
            {"name": "JT", "unit": "count", "category": "vice", "icon": "🚬", "label": None, "sort_order": 2},
        ]
        
        for quota_data in new_quotas:
            quota = Quota(**quota_data)
            session.add(quota)
            print(f"  Added quota: {quota.name} - {quota.unit} (icon: {quota.icon})")
        
        # Set default starting date
        print("\nSetting default starting date...")
        start_date_setting = session.exec(
            select(Setting).where(Setting.key == "start_date")
        ).first()
        
        if start_date_setting:
            start_date_setting.value = "2026-01-01"
            session.add(start_date_setting)
        else:
            start_date_setting = Setting(key="start_date", value="2026-01-01")
            session.add(start_date_setting)
        
        print(f"  Set start_date to: 2026-01-01")

        # Set dice threshold
        print("\nSetting dice threshold...")
        dice_threshold_setting = session.exec(
            select(Setting).where(Setting.key == "dice_threshold")
        ).first()
        
        if dice_threshold_setting:
            dice_threshold_setting.value = "75"
            session.add(dice_threshold_setting)
        else:
            dice_threshold_setting = Setting(key="dice_threshold", value="75")
            session.add(dice_threshold_setting)
        print(f"  Set dice_threshold to: 75%")
        
        session.commit()
        print("\n✅ Data reset and seeding completed successfully!")
        
        # Print summary
        print("\n" + "="*50)
        print("SUMMARY")
        print("="*50)
        ritual_count = len(session.exec(select(Ritual)).all())
        quota_count = len(session.exec(select(Quota)).all())
        log_count = len(session.exec(select(Log)).all())
        
        print(f"Rituals: {ritual_count}")
        print(f"Quotas: {quota_count}")
        print(f"Logs: {log_count}")
        print("="*50)

if __name__ == "__main__":
    print("="*50)
    print("GAME OF LIFE - DATA RESET")
    print("="*50)
    print("\n⚠️  WARNING: This will delete ALL existing data!")
    print("This includes all logs, rituals, and quotas.")
    print("\nPress Ctrl+C to cancel, or Enter to continue...")
    
    try:
        input()
        reset_and_seed_data()
    except KeyboardInterrupt:
        print("\n\n❌ Reset cancelled by user.")
