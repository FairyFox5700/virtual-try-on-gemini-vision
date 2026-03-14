# Virtual Try-On with Gemini Vision

AI-powered virtual try-on application using Google's Imagen and Virtual Try-On models via Vertex AI.

## How It Works

1. **Generate a human model** from a text prompt using Imagen 4.0
2. **Generate clothing items** (tops, bottoms, shoes) from text descriptions
3. **Apply virtual try-on** — each clothing item is applied sequentially onto the model

---

## Google Cloud Setup

### 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select a project** → **New Project**
3. Enter a project name and note the **Project ID** (you'll need it later)
4. Click **Create**

### 2. Enable Billing

Vertex AI requires a billing account.

1. In the Cloud Console, go to **Billing**
2. Link a billing account to your project

### 3. Enable the Vertex AI API

```bash
gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
```

Or enable it in the Console: **APIs & Services** → **Enable APIs** → search for **Vertex AI API** → **Enable**.

### 4. Install the Google Cloud CLI

Download and install from [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install), then run:

```bash
gcloud init
```

Follow the prompts to log in and select your project.

### 5. Authenticate (Application Default Credentials)

```bash
gcloud auth application-default login
```

This opens a browser for Google sign-in and writes credentials that the app will pick up automatically.

### 6. Request Access to the Virtual Try-On Model

The `virtual-try-on-preview-08-04` model is in **preview** and requires allowlist access.

1. Visit the [Virtual Try-On model page](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/virtual-try-on)
2. Click **Request access** and fill out the form
3. Wait for approval email from Google (usually 1–3 business days)

---

## Local Setup

### Prerequisites

- Python 3.10+
- Google Cloud CLI (see above)

### Install dependencies

```bash
pip install -r requirements.txt
```

### Configure the app

Edit the following variables in `try.py`:

| Variable | Description |
|---|---|
| `PROJECT_ID` | Your Google Cloud project ID |
| `LOCATION` | Vertex AI region (default: `europe-west4`) |

```python
PROJECT_ID = "your-project-id"
LOCATION   = "europe-west4"
```

> **Tip:** Supported regions for Vertex AI generative models include `us-central1`, `europe-west4`, and others. Check the [Vertex AI locations page](https://cloud.google.com/vertex-ai/docs/general/locations) for the full list.

---

## Run

```bash
streamlit run try.py
```

The app opens at `http://localhost:8501`.

## Usage

1. Select a preset sample set from the sidebar (10 presets available with different model poses and clothing combinations)
2. Review the model prompt and clothing items in the sidebar
3. Click **Run Virtual Try-On**
4. Watch as the app generates the model, each clothing item, and applies them one by one

---

## Models Used

| Model | Purpose |
|---|---|
| `imagen-4.0-generate-001` | Text-to-image generation for models and clothing |
| `virtual-try-on-preview-08-04` | Applies clothing onto a person image |

## Required IAM Roles

Your Google account (or service account) needs the following role on the project:

| Role | Why |
|---|---|
| `roles/aiplatform.user` | Call Vertex AI APIs |

Assign it in the Console under **IAM & Admin** → **IAM**, or via CLI:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="user:your@email.com" \
  --role="roles/aiplatform.user"
```
