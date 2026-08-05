FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api.py schema.sql load_nhl.py ./

# nhl.db is NOT copied in here on purpose — it lives on the persistent
# volume (mounted at /data on Fly), so it survives restarts/redeploys
# instead of resetting to whatever was baked into the image.

EXPOSE 8000
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
