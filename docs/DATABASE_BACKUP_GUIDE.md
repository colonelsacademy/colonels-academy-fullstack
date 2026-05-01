# Database Backup & Restore Guide

**The Colonel's Academy - Production Database Management**

---

## 📋 Overview

This guide covers database backup and restore procedures for production safety.

**Backup Strategy:**
- ✅ Automated daily backups (GitHub Actions)
- ✅ Manual backup script
- ✅ 30-day retention
- ✅ Compressed storage
- ✅ Easy restore process

---

## 🔄 Automated Backups (Recommended)

### Setup

**1. Add DATABASE_URL to GitHub Secrets:**

```bash
# Go to GitHub repository
Settings → Secrets and variables → Actions → New repository secret

Name: DATABASE_URL
Value: postgresql://user:password@host:5432/database
```

**2. Backups Run Automatically:**
- **Schedule:** Daily at 2 AM UTC (7:45 AM Nepal Time)
- **Retention:** 30 days
- **Location:** GitHub Actions Artifacts

**3. Manual Trigger:**
```bash
# Go to GitHub repository
Actions → Database Backup → Run workflow
```

### Download Backup

```bash
# Go to GitHub repository
Actions → Database Backup → Select run → Download artifact
```

---

## 💻 Manual Backups

### Prerequisites

**Install PostgreSQL client:**

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Create Backup

```bash
# Set environment variable
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Run backup script
chmod +x scripts/backup-database.sh
./scripts/backup-database.sh
```

**Output:**
```
Backing up database...
✓ Backup created successfully
Compressing backup...
✓ Backup compressed: 2.3M
Cleaning up old backups...
✓ No old backups to delete

========================================
Backup Summary
========================================
Backup file: colonels_academy_20260429_143000.sql.gz
Location: ./backups
Total backups: 1
Total size: 2.3M
========================================
```

### Backup Location

```
./backups/
├── colonels_academy_20260429_143000.sql.gz
├── colonels_academy_20260428_143000.sql.gz
└── backup.log
```

---

## 🔧 Restore Database

### ⚠️ WARNING

**Restoring will:**
- DROP all existing data
- Recreate database from backup
- Cannot be undone

**Always:**
1. Create a backup of current database first
2. Test restore on staging environment
3. Notify team before production restore

### Restore Process

```bash
# Set environment variable
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Run restore script
chmod +x scripts/restore-database.sh
./scripts/restore-database.sh backups/colonels_academy_20260429_143000.sql.gz
```

**Interactive Confirmation:**
```
========================================
WARNING: DATABASE RESTORE
========================================
This will DROP and recreate the database!
All current data will be LOST!

Backup file: backups/colonels_academy_20260429_143000.sql.gz
Database: postgresql://...

Are you sure you want to continue? (type 'yes' to confirm): yes

Starting database restore...
Decompressing backup...
Restoring database...
✓ Database restored successfully

========================================
Restore completed successfully
========================================
```

---

## 🏥 Railway Automatic Backups (Recommended)

### Enable Railway Backups

**1. Go to Railway Dashboard:**
```
Project → PostgreSQL → Settings → Backups
```

**2. Enable Automatic Backups:**
- **Frequency:** Daily
- **Retention:** 7 days (free tier) or 30 days (paid)
- **Cost:** Free on Pro plan

**3. Manual Backup:**
```
PostgreSQL → Backups → Create Backup
```

**4. Restore from Railway:**
```
PostgreSQL → Backups → Select backup → Restore
```

### Advantages
- ✅ Automatic daily backups
- ✅ Point-in-time recovery
- ✅ One-click restore
- ✅ No GitHub Actions needed
- ✅ Managed by Railway

---

## 📊 Backup Strategy Comparison

| Method | Frequency | Retention | Cost | Ease |
|--------|-----------|-----------|------|------|
| **Railway Auto** | Daily | 7-30 days | Free* | ⭐⭐⭐⭐⭐ |
| **GitHub Actions** | Daily | 30 days | Free | ⭐⭐⭐⭐ |
| **Manual Script** | On-demand | Custom | Free | ⭐⭐⭐ |

*Free on Railway Pro plan ($5/month)

### Recommended Setup

**Production:**
1. **Primary:** Railway automatic backups (daily)
2. **Secondary:** GitHub Actions (daily)
3. **Emergency:** Manual script (as needed)

**Why multiple backups?**
- Railway backups = fastest restore
- GitHub Actions = offsite backup
- Manual script = emergency situations

---

## 🚨 Disaster Recovery Plan

### Scenario 1: Accidental Data Deletion

**Recovery Time:** 5 minutes

```bash
# 1. Stop application
railway down

# 2. Restore from Railway backup (last 24 hours)
Railway Dashboard → PostgreSQL → Backups → Restore

# 3. Restart application
railway up
```

### Scenario 2: Database Corruption

**Recovery Time:** 10 minutes

```bash
# 1. Stop application
railway down

# 2. Download latest GitHub Actions backup
# Actions → Database Backup → Download artifact

# 3. Restore from backup
export DATABASE_URL="..."
./scripts/restore-database.sh backups/colonels_academy_YYYYMMDD_HHMMSS.sql.gz

# 4. Restart application
railway up
```

### Scenario 3: Complete Railway Failure

**Recovery Time:** 30 minutes

```bash
# 1. Create new PostgreSQL database (Railway/Supabase/etc)

# 2. Get new DATABASE_URL

# 3. Restore from GitHub Actions backup
export DATABASE_URL="new-database-url"
./scripts/restore-database.sh backups/colonels_academy_YYYYMMDD_HHMMSS.sql.gz

# 4. Update environment variables

# 5. Deploy application
```

---

## 📝 Backup Checklist

### Daily (Automated)
- [ ] Railway automatic backup runs
- [ ] GitHub Actions backup runs
- [ ] Check backup logs for errors

### Weekly (Manual)
- [ ] Verify backups are being created
- [ ] Test restore on staging environment
- [ ] Check backup file sizes (should be consistent)

### Monthly (Manual)
- [ ] Download backup to local machine
- [ ] Store offsite (Google Drive/Dropbox)
- [ ] Document any schema changes

---

## 🔍 Troubleshooting

### Backup Script Fails

**Error:** `pg_dump: command not found`

**Solution:**
```bash
# Install PostgreSQL client
sudo apt-get install postgresql-client  # Ubuntu
brew install postgresql                  # macOS
```

**Error:** `DATABASE_URL environment variable is not set`

**Solution:**
```bash
export DATABASE_URL="postgresql://user:password@host:5432/database"
```

### Restore Script Fails

**Error:** `psql: connection refused`

**Solution:**
- Check DATABASE_URL is correct
- Verify database server is running
- Check firewall/network settings

**Error:** `permission denied`

**Solution:**
```bash
chmod +x scripts/restore-database.sh
```

### GitHub Actions Fails

**Error:** `DATABASE_URL secret not found`

**Solution:**
- Add DATABASE_URL to GitHub Secrets
- Settings → Secrets and variables → Actions

---

## 📞 Support

**Questions?**
- Check Railway documentation: https://docs.railway.app/databases/postgresql
- Review backup logs: `./backups/backup.log`
- Contact team lead for production access

---

## 🎯 Quick Reference

```bash
# Create backup
./scripts/backup-database.sh

# Restore backup
./scripts/restore-database.sh backups/file.sql.gz

# List backups
ls -lh backups/

# Check backup size
du -sh backups/

# View backup log
cat backups/backup.log
```

---

**Last Updated:** April 29, 2026  
**Maintained By:** Development Team
