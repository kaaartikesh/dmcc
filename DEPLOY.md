# DMCC — Google Cloud Run Deployment Guide

## Prerequisites

1. [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install) installed
2. A GCP project with billing enabled
3. Your `GEMINI_API_KEY` ready

---

## Step 1: Authenticate & Set Project

```bash
# Login to GCP
gcloud auth login

# Set your project (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

---

## Step 2: Build & Deploy in One Command

The simplest approach — Cloud Build handles the Docker build for you:

```bash
# From the project root directory (where Dockerfile is)
gcloud run deploy dmcc \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "GEMINI_API_KEY=your-api-key-here" \
  --set-env-vars "REDDIT_SUBREDDITS=soccer,football,sports" \
  --set-env-vars "REDDIT_FETCH_LIMIT=8"
```

> **Note:** Replace `your-api-key-here` with your actual Gemini API key.
> **Note:** Replace `us-central1` with your preferred region.

---

## Step 3 (Alternative): Build Docker Image Manually

If you prefer to build and push the image yourself:

```bash
# Set variables
PROJECT_ID=$(gcloud config get-value project)
REGION=us-central1
IMAGE=gcr.io/$PROJECT_ID/dmcc

# Build the Docker image
docker build -t $IMAGE .

# Push to Container Registry
docker push $IMAGE

# Deploy to Cloud Run
gcloud run deploy dmcc \
  --image $IMAGE \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "GEMINI_API_KEY=your-api-key-here" \
  --set-env-vars "REDDIT_SUBREDDITS=soccer,football,sports" \
  --set-env-vars "REDDIT_FETCH_LIMIT=8"
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key for AI analysis |
| `REDDIT_SUBREDDITS` | No | `soccer,football,sports` | Comma-separated subreddits to monitor |
| `REDDIT_FETCH_LIMIT` | No | `8` | Max posts to fetch per scan (max 15) |
| `PORT` | Auto | `8080` | Set automatically by Cloud Run |

### Update Environment Variables After Deployment

```bash
gcloud run services update dmcc \
  --region us-central1 \
  --set-env-vars "GEMINI_API_KEY=new-key-here"
```

---

## Deployment URL

After deployment, your app will be available at:

```
https://dmcc-XXXXXXXXXX-uc.a.run.app
```

The exact URL is printed in the terminal after `gcloud run deploy` completes.

---

## Important Notes

### SQLite on Cloud Run
- Cloud Run containers have an **ephemeral filesystem** — data resets when containers restart
- The app auto-bootstraps from seed data (`data/mvp-db.json`) on each cold start
- This is expected behavior for a demo/hackathon deployment
- For production persistence, consider Cloud SQL (out of scope for this deployment)

### Scaling
- `min-instances 0` means the service scales to zero when idle (free when not in use)
- `max-instances 3` prevents runaway costs
- Adjust as needed for your traffic

---

## Useful Commands

```bash
# Check service status
gcloud run services describe dmcc --region us-central1

# View logs
gcloud run services logs read dmcc --region us-central1

# Delete the service (when done)
gcloud run services delete dmcc --region us-central1
```
