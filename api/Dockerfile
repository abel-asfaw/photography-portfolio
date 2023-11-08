FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11

RUN mkdir -p /app/src/routers
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src/*.py /app/src
COPY ./src/routers/*.py /app/src/routers

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "4000", "--reload"]
