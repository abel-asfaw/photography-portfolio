FROM python:3.15-slim

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
# Shell form so ROOT_PATH can override the path prefix the proxy strips.
CMD exec uvicorn src.main:app --host 0.0.0.0 --port 4000 --root-path "${ROOT_PATH:-/api}"
