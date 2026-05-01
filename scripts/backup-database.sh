#!/bin/bash

###############################################################################
# Database Backup Script for The Colonel's Academy
# 
# Usage: ./scripts/backup-database.sh
# 
# Environment Variables Required:
#   DATABASE_URL - PostgreSQL connection string
#   BACKUP_DIR - Directory to store backups (default: ./backups)
#
# Features:
#   - Creates timestamped backup files
#   - Compresses backups with gzip
#   - Keeps last 7 days of backups
#   - Logs all operations
###############################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="colonels_academy_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAYS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    log "ERROR: $1"
    exit 1
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    error_exit "DATABASE_URL environment variable is not set"
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "Starting database backup..."
echo -e "${YELLOW}Backing up database...${NC}"

# Perform backup
if pg_dump "$DATABASE_URL" > "$BACKUP_PATH"; then
    log "Backup created: $BACKUP_FILE"
    echo -e "${GREEN}✓ Backup created successfully${NC}"
else
    error_exit "pg_dump failed"
fi

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
if gzip "$BACKUP_PATH"; then
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h "${BACKUP_DIR}/${COMPRESSED_FILE}" | cut -f1)
    log "Backup compressed: ${COMPRESSED_FILE} (${COMPRESSED_SIZE})"
    echo -e "${GREEN}✓ Backup compressed: ${COMPRESSED_SIZE}${NC}"
else
    error_exit "Compression failed"
fi

# Clean up old backups (keep last 7 days)
echo -e "${YELLOW}Cleaning up old backups...${NC}"
DELETED_COUNT=$(find "$BACKUP_DIR" -name "colonels_academy_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    log "Deleted $DELETED_COUNT old backup(s)"
    echo -e "${GREEN}✓ Deleted $DELETED_COUNT old backup(s)${NC}"
else
    log "No old backups to delete"
    echo -e "${GREEN}✓ No old backups to delete${NC}"
fi

# Summary
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "colonels_academy_*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "Backup completed successfully"
log "Total backups: $TOTAL_BACKUPS"
log "Total size: $TOTAL_SIZE"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Backup file: ${COMPRESSED_FILE}"
echo -e "Location: ${BACKUP_DIR}"
echo -e "Total backups: ${TOTAL_BACKUPS}"
echo -e "Total size: ${TOTAL_SIZE}"
echo -e "${GREEN}========================================${NC}"
echo ""

exit 0
