import os

# Settings are read at import time, so provide dummy values before any
# `src` module is imported. Real values come from the environment/.env.
TEST_ENV = {
    "DB_NAME": "test",
    "DB_PASS": "test",
    "DB_USER": "test",
    "DB_HOST": "localhost",
    "AWS_ACCESS_KEY_ID": "test",
    "AWS_SECRET_ACCESS_KEY": "test",
    "AWS_REGION": "us-west-2",
    "S3_BUCKET_NAME": "test",
    "SUPABASE_URL": "https://example.supabase.co",
    "ADMIN_USER_ID": "00000000-0000-0000-0000-000000000001",
}

for key, value in TEST_ENV.items():
    os.environ[key] = value
