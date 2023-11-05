from decouple import config
import boto3


AWS_ACCESS = config("AWS_ACCESS_KEY_ID")
AWS_SECRET = config("AWS_SECRET_ACCESS_KEY")
AWS_REGION = config("AWS_REGION")


s3 = boto3.resource(
    "s3",
    aws_access_key_id=AWS_ACCESS,
    aws_secret_access_key=AWS_SECRET,
    region_name=AWS_REGION,
)
