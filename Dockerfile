FROM node:20-slim

# ── System deps ───────────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl git python3 python3-pip python3-venv ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Node dependencies (cached layer) ─────────────────────────────────────────
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# ── Python dependencies ───────────────────────────────────────────────────────
COPY requirements.txt ./
RUN pip3 install --break-system-packages -r requirements.txt

# ── App source ────────────────────────────────────────────────────────────────
COPY . .

EXPOSE 5000

# Build args that get baked into the image (set via docker-compose build args or --build-arg)
ARG SUPABASE_URL=""
ARG SUPABASE_ANON_KEY=""

# Write supabase config from build args if provided
RUN if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ]; then \
      printf '{\n  "url": "%s",\n  "anonKey": "%s"\n}\n' \
        "$SUPABASE_URL" "$SUPABASE_ANON_KEY" > lib/supabase.config.json; \
      echo "[Docker] Supabase config written from build args."; \
    else \
      echo "[Docker] No SUPABASE_URL/KEY provided — app runs in guest mode."; \
    fi

ENV CI=1 \
    EXPO_NO_DOTENV=1

# Default: run the Expo web dev server
CMD ["npx", "expo", "start", "--web", "--port", "5000", "--non-interactive"]
