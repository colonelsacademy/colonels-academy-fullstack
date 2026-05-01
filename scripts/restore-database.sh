#!/bin/bash

###############################################################################
# Database Restore Script for The Colonel's Academy
# 
# Usage: ./scripts/restore-database.sh <backup-file>
# Example: ./scripts/restore-database.sh backups/colonels_academy_20260429_143000.sql.gz
#
# Environment Variables Required:
#   DATABASE_URL - PostgreSQL connection string
#
# WARNING: This will DROP and recreate the database!
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}ERROR: No backup file specified${NC}"
    echo "Usage: $0 <backup-file>"
    echo "Example: $0 backups/colonels_academy_20260429_143000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}ERROR: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL environment variable is not set${NC}"
    exit 1
fi

# Warning
echo -e "${RED}========================================${NC}"
echo -e "${RED}WARNING: DATABASE RESTORE${NC}"
echo -e "${RED}========================================${NC}"
echo -e "${YELLOW}This will DROP and recreate the database!${NC}"
echo -e "${YELLOW}All current data will be LOST!${NC}"
echo ""
echo -e "Backup file: ${BACKUP_FILE}"
echo -e "Database: ${DATABASE_URL}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Starting database restore...${NC}"

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}Decompressing backup...${NC}"
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    SQL_FILE="$TEMP_FILE"
    CLEANUP_TEMP=true
else
    SQL_FILE="$BACKUP_FILE"
    CLEANUP_TEMP=false
fi

# Restore database
echo -e "${YELLOW}Restoring database...${NC}"
if psql "$DATABASE_URL" < "$SQL_FILE"; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
else
    echo -e "${RED}ERROR: Database restore failed${NC}"
    if [ "$CLEANUP_TEMP" = true ]; then
        rm -f "$TEMP_FILE"
    fi
    exit 1
fi

# Cleanup temp file
if [ "$CLEANUP_TEMP" = true ]; then
    rm -f "$TEMP_FILE"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Restore completed successfully${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

exit 0
