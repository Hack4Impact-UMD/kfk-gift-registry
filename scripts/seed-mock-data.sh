# pnpm seed

#!/bin/bash
set -e

echo "Seeding Firestore..."

flame use emulator

echo "Clearing old data..."
flame rm profile-updates --force || true
flame rm invites --force || true
flame rm claims --force || true
flame rm gifts --force || true
flame rm children --force || true
flame rm family-links --force || true
flame rm families --force || true
flame rm users --force || true
flame rm gift-drives --force || true

echo "Uploading data..."

DATA_DIR="scripts/data"

cat ${DATA_DIR}/gift-drives.json | flame up gift-drives --idField="id"
cat ${DATA_DIR}/users.json | flame up users --idField="id"
cat ${DATA_DIR}/families.json | flame up families --idField="id"
cat ${DATA_DIR}/family-links.json | flame up family-links --idField="id"
cat ${DATA_DIR}/children.json | flame up children --idField="id"
cat ${DATA_DIR}/gifts.json | flame up gifts --idField="id"
cat ${DATA_DIR}/claims.json | flame up claims --idField="id"

# empty collections rn, but we can add some mock profile updates later 
cat ${DATA_DIR}/profile-updates.json | flame up profile-updates --idField="id"
cat ${DATA_DIR}/invites.json | flame up invites --idField="id"

echo "Done!"
