#!/bin/bash
set -e

echo "Seeding Firestore with mock data..."

# 1. Ensure emulator mode
flame use emulator

# 2. Clear existing collections (safe reset)
echo "Clearing old data..."

flame rm claims --force || true
flame rm gifts --force || true
flame rm children --force || true
flame rm familyLinks --force || true
flame rm families --force || true
# flame rm users --force || true
flame rm giftDrives --force || true

# 3. Seed GiftDrive
echo "Seeding giftDrive..."

flame up giftDrives/gd_2026_halloween --data '{
  "id": "gd_2026_halloween",
  "createdAt": "2026-03-31T17:00:00.000Z",
  "startDate": "2026-10-01T00:00:00.000Z",
  "endDate": "2026-10-31T23:59:59.000Z",
  "cycle": "Halloween 2026"
}'

# 4. Seed Users (Donors)
echo "Seeding users..."

flame up users/donor_1 --data '{
  "id": "donor_1",
  "email": "donor1@test.com",
  "name": "Test Donor One",
  "role": "DONOR",
  "createdAt": "2026-03-31T17:01:00.000Z",
  "enabled": true
}'

flame up users/donor_2 --data '{
  "id": "donor_2",
  "email": "donor2@test.com",
  "name": "Test Donor Two",
  "role": "DONOR",
  "createdAt": "2026-03-31T17:01:30.000Z",
  "enabled": true
}'

# 5. Seed Family
echo "Seeding family..."

flame up families/family_1 --data '{
  "id": "family_1",
  "contactName": "Maria Johnson",
  "email": "maria.johnson@test.com",
  "phone": "301-555-0101",
  "address": {
    "street": "123 Main St",
    "city": "College Park",
    "state": "MD",
    "zipCode": "20740"
  },
  "giftDrive": "gd_2026_halloween",
  "createdAt": "2026-03-31T17:02:00.000Z",
  "reviewStatus": {
    "approved": true,
    "held": false,
    "lastReviewedAt": "2026-03-31T17:02:00.000Z",
    "reviewedBy": "admin_1",
    "reviewNotes": "Approved for testing"
  }
}'

# 6. Family Link
echo "Seeding family link..."

flame up familyLinks/fl_1 --data '{
  "id": "fl_1",
  "familyId": "family_1",
  "active": true
}'

# 7. Children
echo "Seeding children..."

flame up children/child_1 --data '{
  "id": "child_1",
  "name": "Ethan Johnson",
  "status": "recently_diagnosed_relapse",
  "category": "warrior",
  "familyId": "family_1",
  "diagnosis": "Leukemia",
  "diagnosisLengthYears": "6m-1y",
  "livesAtHome": true,
  "publicBlurb": "Loves Legos and Marvel.",
  "createdAt": "2026-03-31T17:03:00.000Z",
  "hospital": "Childrens National",
  "age": 8,
  "childSocialWorker": "SW1",
  "giftDrive": "gd_2026_halloween",
  "published": true
}'

flame up children/child_2 --data '{
  "id": "child_2",
  "name": "Ava Johnson",
  "status": "sibling_in_treatment",
  "category": "super_sib",
  "familyId": "family_1",
  "diagnosis": "Sibling case",
  "livesAtHome": true,
  "createdAt": "2026-03-31T17:03:30.000Z",
  "hospital": "Childrens National",
  "age": 11,
  "childSocialWorker": "SW1",
  "giftDrive": "gd_2026_halloween",
  "published": false
}'

# 8. Gifts
echo "Seeding gifts..."

flame up gifts/gift_1 --data '{
  "id": "gift_1",
  "childId": "child_1",
  "familyId": "family_1",
  "giftDrive": "gd_2026_halloween",
  "title": "LEGO Classic Set",
  "productUrl": "https://amazon.com/example-lego",
  "listedPrice": 29.99,
  "status": "AVAILABLE",
  "createdAt": "2026-03-31T17:04:00.000Z",
  "backup": false,
  "active": true
}'

flame up gifts/gift_2 --data '{
  "id": "gift_2",
  "childId": "child_1",
  "familyId": "family_1",
  "giftDrive": "gd_2026_halloween",
  "title": "Marvel Action Figures",
  "productUrl": "https://amazon.com/example-marvel",
  "listedPrice": 24.99,
  "status": "CLAIMED",
  "claimedByDonorId": "donor_1",
  "createdAt": "2026-03-31T17:04:30.000Z",
  "backup": false,
  "active": true
}'

# 9. Claim
echo "Seeding claim..."

flame up claims/claim_1 --data '{
  "id": "claim_1",
  "giftId": "gift_2",
  "childId": "child_1",
  "donorId": "donor_1",
  "claimedAt": "2026-03-31T17:05:30.000Z",
  "active": true
}'

echo "Seeding complete!"
