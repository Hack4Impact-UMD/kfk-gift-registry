# Donor User Manual — Kisses for Kyle Gift Registry

## 1. Purpose

This guide explains the full donor experience in the Kisses for Kyle Gift Registry, from browsing gifts to managing post-claim actions.

---

## 2. Donor Journey Overview

1. Open the **Storefront** (`/`).
2. Browse children and open a child profile.
3. Add available gifts to your cart.
4. Go to **Checkout** (`/checkout`) and claim gifts.
5. If not logged in, log in or create a donor account in checkout.
6. After claiming, use **Donor Home** (`/donor/home`) to track and update each gift.
7. Use **Notifications** (`/donor/notifications`) for pending purchase/delivery actions.

---

## 3. Access and Account Scenarios

### 3.1 Guest Donor (Not Logged In)

- You can browse the storefront and add gifts to cart.
- At checkout, you must either:
  - **Log in**, or
  - **Create a donor account**.

### 3.2 Logged-In Donor

- You can claim gifts directly at checkout.
- You can access:
  - **Donor Home** (`/donor/home`)
  - **Notifications** (`/donor/notifications`)

### 3.3 Logged-In Non-Donor (Staff/Admin/Volunteer)

- You cannot claim gifts.
- Checkout shows: **“Only donors can claim gifts. Please log in with a donor account.”**

### 3.4 Password Recovery

- **Forgot password:** `/forgotPassword`
- **Reset password via email link:** `/resetPassword?oobCode=...`
- **Reset success page:** `/resetSuccess`

---

## 4. Storefront Usage

### 4.1 Main Storefront Page (`/`)

- View active drive cards for children.
- Use search by child name/diagnosis.
- Sort by:
  - Age (ascending/descending)
  - Gifts claimed (ascending/descending)
- Paginate through child cards.

### 4.2 Child Profile (`/child/$childId`)

- View child details and wishlist.
- Gift statuses drive button behavior:
  - **AVAILABLE**: can be claimed
  - Any other status: already claimed/unavailable
- View sibling carousel (if available).

### 4.3 Off-Season Scenario

- If no active drive exists, storefront shows off-season screen with next drive messaging and recent drive stats (if available).

---

## 5. Cart and Checkout

### 5.1 Cart Behavior

- Cart is stored in browser local storage (`gift-drive-cart`).
- Removing gifts is supported from checkout.
- If cart is empty, checkout shows **“Your cart is empty.”**

### 5.2 Gift Availability at Checkout

- If any cart gift is no longer available, checkout blocks claim and asks you to remove unavailable gifts.

### 5.3 Claim Confirmation

- Checkout confirms that you are committing to buy gifts (not performing direct purchase in-app).
- You must confirm commitment in modal before claim is submitted.

### 5.4 Authentication Modal at Checkout (Guest Flow)

- Two tabs:
  - **Log-in**
  - **Create Account**
- Cart is preserved while authenticating.

### 5.5 Create Account Validation Rules

- Full name required.
- Phone format required: `(555)-555-5555` in form, converted to E.164 internally.
- Valid email required.
- Password must include:
  - 8+ characters
  - uppercase letter
  - lowercase letter
  - number
  - special character
- Confirm password must match.

### 5.6 Post-Claim Result

- Successful claim:
  - Cart is cleared
  - User is redirected to `/donor/home`
  - Gift status becomes **CLAIMED**

---

## 6. Donor Home (`/donor/home`)

### 6.1 What You See

- Child cards for families where you have active claims in the current drive.
- If no claims: **“You have not claimed any gifts yet.”**

### 6.2 Gift Action States

- **CLAIMED** → You can mark as purchased.
- **PURCHASED** → You can mark as delivered.
- **DELIVERED** → Waiting for family confirmation to become received.
- **RECEIVED** → No longer active in your action list.

### 6.3 Actions You Can Take

- Mark gift as purchased.
- Mark gift as delivered.
- Upload purchase receipt (optional).
- Upload delivery confirmation receipt (optional).
- Save/update tracking number.
- Unclaim gift (only while still in CLAIMED, not yet purchased).

### 6.4 Undo and Save Behavior

- “Undo Actions” mode allows edits before final save.
- If gift is already purchased/delivered, true rollback is blocked; contact KFK support.
- Unsaved change navigation triggers a confirmation dialog.

### 6.5 Unclaim Rules

- Allowed only for gifts still in **CLAIMED** state.
- Not allowed once purchased/delivered/received.

---

## 7. Notifications (`/donor/notifications`)

### 7.1 Notification Types

- **Purchase Confirmation Needed**
  - Triggered when a gift is CLAIMED without purchase confirmation.
- **Delivery Confirmation Needed**
  - Triggered when a gift is PURCHASED without delivery confirmation.

### 7.2 Notification Features

- Tabs: **Unread** and **Read**
- Open details view per notification
- Mark single notification as read
- Mark all unread notifications as read
- “Go to action” button deep-links to related child section in donor home

### 7.3 Address Handling

- Purchase confirmation notifications may show family delivery address.
- “Copy Address” is available when address data exists.

---

## 8. Authentication and Session Actions

### 8.1 Login (`/login`)

- Email + password required.
- Invalid credentials return login error.
- Forgot password link sends to `/forgotPassword`.

### 8.2 Logout

- Available from donor profile menu in top navigation.
- Requires confirmation in modal.

### 8.3 MFA Notes

- Donor checkout/login flows support MFA challenge handling when required.
- Staff-only forced MFA enrollment does not apply to donors.

---

## 9. System Messages and Edge Cases

- Child list load failure → storefront error message.
- Child not found → “Child Not Found.”
- Checkout load failure → “Unable to load cart. Please try again.”
- No cart items on claim attempt → “No gifts in cart. Please add some gifts to your cart.”
- Gift becomes unavailable before claim transaction → claim fails; remove unavailable gift and retry.
- Notifications or donor home load errors show retry guidance.

---

## 10. Support

For donor questions or account/gift action issues, contact:

- **info@kissesforkyle.org**
