# ---- Base image ----
FROM python:3.11-slim AS python-base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Build React ----
FROM python-base AS build-stage
COPY . .
WORKDIR /app/frontend
RUN npm install && npm run build

# ---- Final ----
FROM python-base AS final
WORKDIR /app
COPY --from=build-stage /app .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Run migrations + start server
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:$PORT
