FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# docker-compose builds with requirements-dev.txt so tests can run in the
# local container; production images get the runtime dependencies only.
ARG REQUIREMENTS=requirements.txt
COPY requirements.txt requirements-dev.txt ./
RUN pip install --no-cache-dir -r ${REQUIREMENTS}

COPY . .

RUN useradd --create-home app
USER app

EXPOSE 4000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "4000"]
