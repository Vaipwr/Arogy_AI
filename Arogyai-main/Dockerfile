FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed by OpenCV / Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY backend/ ./backend/
COPY ml/models/ ./ml/models/
COPY models/ ./models/

# Default port
ENV PORT=7860
EXPOSE 7860
EXPOSE 8000

# Start FastAPI server supporting any dynamic PORT injected by cloud platforms
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
