# Quick Commands

## 🚀 Start/Stop

```bash
# Start everything
pnpm dev

# Start database
docker compose up -d

# Stop database
docker compose down
```

---

## 🗄️ Database

```bash
# View database UI
pnpm --filter api exec prisma studio

# Create migration
pnpm --filter api exec prisma migrate dev --name your_change

# Check status
pnpm --filter api exec prisma migrate status

# Sync schema (quick fix)
pnpm --filter api exec prisma db push

# Reset database (⚠️ deletes data)
pnpm --filter api exec prisma migrate reset

# Update types
pnpm --filter api exec prisma generate
```

---

## 🧹 Fixes

```bash
# Port in use (3000 or 4000)
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9

# Permission issues
sudo rm -rf apps/api/dist && sudo chown -R $(whoami) apps/api

# Clean install
rm -rf node_modules apps/*/node_modules && pnpm install

# Approve builds
pnpm approve-builds
```

---

## 📦 Install Packages

```bash
# API
pnpm --filter api add package-name

# Web
pnpm --filter web add package-name
```


# production
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma db push