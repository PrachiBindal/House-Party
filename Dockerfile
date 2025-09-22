# ---- Base image for Python ----
FROM python:3.11-slim AS python-base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy Python dependencies
COPY requirements.txt .

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# ---- Build React ----
FROM python-base AS build-stage

# Copy everything
COPY . .

# Build React frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# ---- Final stage ----
FROM python-base AS final

WORKDIR /app

# Copy code from build-stage
COPY --from=build-stage /app .

# Collect static files (including React build output)
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Start Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

