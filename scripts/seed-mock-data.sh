#!/bin/bash
set -e

echo "Seeding Firestore..."

flame use emulator

echo "Clearing old data..."
flame rm claims --force || true
flame rm gifts --force || true
flame rm children --force || true
flame rm familyLinks --force || true
flame rm families --force || true
flame rm users --force || true
flame rm giftDrives --force || true

echo "Uploading data..."

DATA_DIR="scripts/data"

cat ${DATA_DIR}/giftDrives.json | flame up giftDrives --idField="id"
cat ${DATA_DIR}/users.json | flame up users --idField="id"
cat ${DATA_DIR}/families.json | flame up families --idField="id"
cat ${DATA_DIR}/familyLinks.json | flame up familyLinks --idField="id"
cat ${DATA_DIR}/children.json | flame up children --idField="id"
cat ${DATA_DIR}/gifts.json | flame up gifts --idField="id"
cat ${DATA_DIR}/claims.json | flame up claims --idField="id"

echo "Done!"