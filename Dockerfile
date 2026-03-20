FROM node:20-slim

# ── System dependencies ────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl \
      git \
      python3 \
      python3-pip \
      python3-venv \
      ca-certificates \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
         | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
         > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get install -y gh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Node dependencies (cached layer) ──────────────────────────────────────────
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# ── Python dependencies (for scraper scripts) ─────────────────────────────────
COPY requirements.txt ./
RUN pip3 install --break-system-packages -r requirements.txt

# ── Copy source ───────────────────────────────────────────────────────────────
COPY . .

EXPOSE 5000

# GH_TOKEN is injected at runtime via docker-compose or -e flag.
# The setup-env.js script uses it to fetch SUPABASE_URL and SUPABASE_ANON_KEY
# from your GitHub repo variables and writes them to .env before Expo starts.
ENV CI=1
CMD ["sh", "-c", "node scripts/setup-env.js && npx expo start --web --port 5000"]
