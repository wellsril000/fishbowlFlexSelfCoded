# Dockerfile for Railway
# This installs libpostal system dependencies, then Python packages

FROM python:3.11-slim

# Install system dependencies for libpostal
RUN apt-get update && apt-get install -y \
    pkg-config \
    autoconf \
    automake \
    libtool \
    curl \
    make \
    gcc \
    g++ \
    gettext \
    git \
    libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install libpostal from source
RUN git clone https://github.com/openvenues/libpostal.git /tmp/libpostal && \
    cd /tmp/libpostal && \
    ./bootstrap.sh && \
    ./configure --datadir=/usr/share/libpostal && \
    make -j4 && \
    make install && \
    ldconfig && \
    rm -rf /tmp/libpostal

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway sets PORT env var, default to 8000)
EXPOSE 8000

# Start command (use shell form to expand $PORT)
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"

