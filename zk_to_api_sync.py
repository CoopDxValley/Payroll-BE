#!/usr/bin/env python3
"""
ZK Device to API Sync Script
This script fetches attendance data from ZK biometric device and syncs it to the attendance API.
Run this script twice a day (morning and evening) for automatic punch in/out detection.

SMART PUNCH LOGIC:
- Each user can have only ONE punch in and ONE punch out per day
- First record of the day = PUNCH IN
- If user has punch in but no punch out = next record becomes PUNCH OUT  
- If user already has both punch in and punch out = additional records are skipped
- Duplicate records (same timestamp) are automatically skipped
"""

import json
import requests
from datetime import datetime, timedelta
from zk import ZK

# Device Configuration
DEVICE_IP = '192.168.222.191'
DEVICE_PORT = 4370
DEVICE_PASSWORD = 123456

# API Configuration
API_BASE_URL = 'http://localhost:3000'  # Change this to your API URL
API_ENDPOINT = f'{API_BASE_URL}/api/attendance/bulk-device-registration'

# Authentication (replace with your auth token or login credentials)
AUTH_TOKEN = 'your-jwt-token-here'  # Get this from your login API

def get_device_attendance_data(target_date=None):
    """Fetch attendance data from ZK device for a specific date."""
    
    if target_date is None:
        target_date = datetime.now().date()
    
    zk = ZK(DEVICE_IP, port=DEVICE_PORT, timeout=5, password=DEVICE_PASSWORD)
    
    try:
        conn = zk.connect()
        print(f"Device connected successfully.")
        
        attendance = conn.get_attendance()
        
        # Filter records for the target date
        filtered_records = []
        for log in attendance:
            if log.timestamp and log.timestamp.date() == target_date:
                record = {
                    "user_id": str(log.user_id),
                    "timestamp": log.timestamp.strftime('%Y-%m-%dT%H:%M:%S.%fZ'),
                    "status": log.status,
                    "punch": log.punch,
                    "uid": str(log.uid),
                    "device_ip": DEVICE_IP
                }
                filtered_records.append(record)
        
        conn.disconnect()
        print(f"Found {len(filtered_records)} attendance records for {target_date}")
        return filtered_records
        
    except Exception as e:
        print(f"Failed to fetch attendance data: {e}")
        return []

def send_to_api(records):
    """Send attendance records to the bulk registration API."""
    
    if not records:
        print("No records to send.")
        return
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {AUTH_TOKEN}'
    }
    
    payload = {
        "records": records
    }
    
    try:
        response = requests.post(
            API_ENDPOINT, 
            json=payload, 
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Bulk registration successful!")
            print(f"   Total records: {result.get('totalRecords', 0)}")
            print(f"   Processed: {result.get('processedRecords', 0)}")
            print(f"   Skipped duplicates: {result.get('skippedDuplicates', 0)}")
            print(f"   Skipped (complete day): {result.get('skippedComplete', 0)}")
            
            if result.get('errors'):
                print("⚠️  Some errors occurred:")
                for error in result['errors']:
                    print(f"   - {error}")
        else:
            print(f"❌ API request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to send data to API: {e}")

def sync_attendance(date_str=None):
    """Main function to sync attendance data."""
    
    # Parse target date
    if date_str:
        try:
            target_date = datetime.strptime(date_str, "%m/%d/%Y").date()
        except ValueError:
            print(f"Invalid date format. Use MM/DD/YYYY. Got: {date_str}")
            return
    else:
        target_date = datetime.now().date()
    
    print(f"🔄 Syncing attendance data for {target_date}")
    
    # Fetch data from device
    records = get_device_attendance_data(target_date)
    
    if records:
        # Send to API
        send_to_api(records)
    else:
        print("No attendance records found for the specified date.")

def sync_today():
    """Sync today's attendance data."""
    sync_attendance()

def sync_yesterday():
    """Sync yesterday's attendance data."""
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%m/%d/%Y")
    sync_attendance(yesterday)

def sync_date_range(start_date, end_date):
    """Sync attendance data for a date range."""
    start = datetime.strptime(start_date, "%m/%d/%Y").date()
    end = datetime.strptime(end_date, "%m/%d/%Y").date()
    
    current_date = start
    while current_date <= end:
        sync_attendance(current_date.strftime("%m/%d/%Y"))
        current_date += timedelta(days=1)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) == 1:
        # No arguments - sync today's data
        sync_today()
    elif len(sys.argv) == 2:
        # One argument - sync specific date
        sync_attendance(sys.argv[1])
    elif len(sys.argv) == 3:
        # Two arguments - sync date range
        sync_date_range(sys.argv[1], sys.argv[2])
    else:
        print("Usage:")
        print("  python zk_to_api_sync.py                    # Sync today's data")
        print("  python zk_to_api_sync.py MM/DD/YYYY         # Sync specific date")
        print("  python zk_to_api_sync.py MM/DD/YYYY MM/DD/YYYY  # Sync date range")
        print("")
        print("Examples:")
        print("  python zk_to_api_sync.py")
        print("  python zk_to_api_sync.py 07/27/2025")
        print("  python zk_to_api_sync.py 07/25/2025 07/27/2025") 