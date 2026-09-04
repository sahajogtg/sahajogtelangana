# SahajaYogaTelangana — Saadhak App: Comprehensive Requirements Document

**Version:** 2.0  
**Date:** 2 September 2026  
**Prepared for:** Development Team  
**Applications:** 
- Web: sahajayogatelangana.org (Next.js + MongoDB)
- Mobile: SahajaYogaTelangana_APP (Expo/React Native)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Feature 1: Document Upload (Replace Real-Time OCR)](#3-feature-1-document-upload-replace-real-time-ocr)
4. [Feature 2: Lock Seeker Contact for Non-Volunteers](#4-feature-2-lock-seeker-contact-for-non-volunteers)
5. [Feature 3: Phone Number Authentication (OTP Login)](#5-feature-3-phone-number-authentication-otp-login)
6. [Feature 4: Email-to-Phone Migration Analysis](#6-feature-4-email-to-phone-migration-analysis)
7. [Feature 5: Contact Invitation System](#7-feature-5-contact-invitation-system)
8. [Feature 6: Volunteer Event Request Workflow](#8-feature-6-volunteer-event-request-workflow)
9. [Feature 7: Event Tracking for Requester](#9-feature-7-event-tracking-for-requester)
10. [Gap Analysis & Open Questions](#10-gap-analysis--open-questions)
11. [Technical Architecture Notes](#11-technical-architecture-notes)
12. [Implementation Priority & Phasing](#12-implementation-priority--phasing)
13. [Mobile App Integration Notes](#13-mobile-app-integration-notes)

---

## 1. Executive Summary

The Saadhak app serves Sahaja Yoga Telangana's volunteer and seeker management needs across two platforms: a Next.js web app and an Expo/React Native mobile app. Both share the same MongoDB backend. This document defines 7 feature areas that need implementation or improvement:

| # | Feature | Effort | Priority | Web Status | Mobile Status |
|---|---------|--------|----------|------------|---------------|
| 1 | Document Upload (replace real-time OCR) | Small | P0 — immediate | ✅ Implemented | ✅ Implemented |
| 2 | Lock Seeker Contact for Non-Volunteers | Small | P0 — immediate | ✅ Implemented | Needs sync |
| 3 | Phone OTP Authentication | Medium-Large | P1 — high | Not started | Not started |
| 4 | Email-to-Phone Migration | Large | P1 — after Feature 3 | Not started | Not started |
| 5 | Contact Invitation System | Medium | P2 — after Feature 4 | Not started | Designed (VOLUNTEER-INVITE-ARCHITECTURE.md) |
| 6 | Volunteer Event Request Workflow | Medium | P1 — parallel with Feature 3 | Not started | Not started |
| 7 | Event Tracking for Requester | Medium | P2 — after Feature 6 | Not started | Not started |

**Note:** The mobile app already has extensive planning documents:
- `BRD.md` — Phase 2 features (onboarding, seeker dashboard, notifications, journal, festivals)
- `ARCHITECTURE.md` — Architecture plan
- `ENGINEERING-PLAN.md` — 8-sprint engineering plan (~8 weeks)
- `VOLUNTEER-INVITE-ARCHITECTURE.md` — Detailed volunteer invite system design

---

## 2. System Architecture Overview

### 2.1 Dual-Platform Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      SahajaYogaTelangana                     │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js)          │  Mobile App (Expo/RN)         │
│  - App Router               │  - Expo Router                │
│  - Tailwind CSS             │  - NativeWind                 │
│  - NextAuth.js v4           │  - Custom auth store          │
│  - Server components        │  - Client-only                │
├─────────────────────────────────────────────────────────────┤
│                    Shared Backend (MongoDB)                   │
│  - Mongoose models          │  - Same API endpoints         │
│  - Next.js API routes       │  - Bearer token auth          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Tech Stack

#### Web App (SahajaYogaOdisha)
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, React (client/server components)
- **Backend:** Next.js API routes, MongoDB via Mongoose
- **Auth:** NextAuth.js v4 (email/password + Google OAuth + Magic Link)
- **Email:** Nodemailer (SMTP)
- **AI/OCR:** OpenRouter (free vision models) + Google Gemini (fallback) — **DEPRECATED**

#### Mobile App (SahajaYogaTelangana_APP)
- **Framework:** Expo SDK 54, React Native
- **Navigation:** Expo Router (file-based routing)
- **Styling:** NativeWind (Tailwind CSS for RN)
- **State:** Zustand stores (auth, theme)
- **Storage:** expo-secure-store (iOS), AsyncStorage (Android/Web)
- **Camera:** expo-image-picker

### 2.3 User Roles
| Role | Capabilities |
|------|-------------|
| `User` | Basic authenticated user, limited dashboard |
| `Yogi` | Can add seekers, access dashboard |
| `Volunteer` | Full follow-up access, can add seekers, contact seekers |
| `Admin` | Full access, admin panel (15 pages) |

### 2.4 Key Models
- **User** — email (required, unique), name, password, role, city, language
- **Seeker** — name, phone (required), city, email, assignedVolunteer, followUpStatus, gender, source
- **VolunteerProfile** — name, email, gender, city, language, roles, staffingFocus, isActive
- **Event** — title, description, date, time, location, isActive
- **EventRequest** — eventName, proposedStartDate, status (Pending/Approved/Rejected), userId, approvedEventId

### 2.5 Key Existing Flows
- **Seeker Registration:** Public form → creates Seeker doc with `source: "QR Self Registration"`
- **Add Seeker (Yogi):** Manual entry / Camera scan / CSV upload → creates Seeker docs
- **Seeker Follow-up:** Batch-based (4 seekers), geo-ring matching, language + gender filtering
- **Event Request:** User submits → admin reviews → approves (auto-creates Event) / rejects
- **Volunteer Invite:** One-time referral link → existing user becomes Volunteer

---

## 3. Feature 1: Document Upload (Replace Real-Time OCR)

### 3.1 Problem Statement
The current OCR system (`/add-seeker/scan`) tries to extract seeker data from images in real-time using AI vision models. This is unreliable — the AI often misreads handwritten or poorly formatted registration sheets.

### 3.2 Proposed Solution
Replace the real-time OCR flow with a simple **upload-and-wait** model:

1. **Volunteer uploads** an image (photo of registration sheet) or document (PDF/CSV)
2. **System shows a confirmation:** "Thank you! Your document has been uploaded. The seekers will be added within 24 hours."
3. **Admin processes manually** from the admin dashboard using an OCR scanner or by reading the image

### 3.3 Implementation Status

#### Web App (Completed)
- ✅ Created `src/models/DocumentUpload.ts`
- ✅ Created `src/app/api/document-uploads/route.ts`
- ✅ Created `src/app/api/auth/admin/document-uploads/route.ts`
- ✅ Created `src/app/api/auth/admin/document-uploads/[id]/route.ts`
- ✅ Rewrote `src/app/(auth)/add-seeker/scan/page.tsx` to upload-only flow

#### Mobile App (Completed)
- ✅ Rewrote `src/app/seeker/scan-page.tsx` to upload-only flow
- ✅ Removed OCR processing, now uploads to `/api/document-uploads`

### 3.4 API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/document-uploads` | Upload a document/image |
| `GET` | `/api/auth/admin/document-uploads` | List all uploads (admin only) |
| `PATCH` | `/api/auth/admin/document-uploads/[id]` | Mark as processed, add processed count |

---

## 4. Feature 2: Lock Seeker Contact for Non-Volunteers

### 4.1 Problem Statement
Currently, any logged-in Yogi can see seeker phone numbers and Call/WhatsApp buttons on the follow-up page. Only volunteers should be able to contact seekers directly.

### 4.2 Proposed Solution
Hide the Call/WhatsApp buttons and phone numbers for non-volunteer users. Show a "Contact your volunteer coordinator" message instead.

### 4.3 Implementation Status

#### Web App (Completed)
- ✅ Updated `src/app/dashboard/seeker-followups/page.tsx`
- ✅ Non-volunteers see masked phone and "contact volunteer coordinator" message
- ✅ Call/WhatsApp buttons only visible to volunteers

#### Mobile App (Pending)
- Needs same changes in `src/app/seeker/followups.tsx`

### 4.4 Access Control Logic
```typescript
function isVolunteer(user): boolean {
  return user.role === "Volunteer" || user.role === "Admin" || 
         hasVolunteerProfile(user.email)
}
```

---

## 5. Feature 3: Phone Number Authentication (OTP Login)

### 5.1 Problem Statement
The current auth system uses email + password. In India, many users (especially yoga volunteers and seekers) are more comfortable with phone number + OTP. Email is not universally used.

### 5.2 Analysis: Phone OTP Options

#### 5.2.1 Free Options

| Provider | Free Tier | Limitations |
|----------|-----------|-------------|
| **Firebase Auth (Phone)** | 10K verifications/month | Requires Google account, setup complexity |
| **Supabase Auth** | 50K monthly active users | Requires Supabase project |
| **Twilio Verify** | First 500 SMS/month | Very limited free tier |
| **MSG91** | 100 SMS/month (free plan) | India-focused, cheap paid plans |
| **2Factor.in** | 100 SMS/month (free plan) | India-focused, simple API |

#### 5.2.2 Recommended: Firebase Auth (Phone)
- **Cost:** Free up to 10K verifications/month (more than enough for this app)
- **Setup:** Create a Firebase project, enable Phone Authentication
- **Pros:** Well-documented, reliable, handles OTP delivery, supports reCAPTCHA
- **Cons:** Google dependency, requires `firebase` npm package

#### 5.2.3 Alternative: MSG91 (India-Specific)
- **Cost:** ₹0.20 per SMS after free tier (very affordable)
- **Setup:** Create MSG91 account, get API key
- **Pros:** India-focused, Hindi/Telugu OTP templates, WhatsApp OTP support
- **Cons:** Paid after free tier, requires account verification

### 5.3 Proposed Solution

#### 5.3.1 Auth Flow (Phone OTP)

```
User enters phone number
  ↓
System sends 6-digit OTP via SMS
  ↓
User enters OTP
  ↓
System verifies OTP
  ↓
If phone exists in User table → log in
If phone is new → create User with role "User" + ask for name
```

#### 5.3.2 Database Changes

**Modify: `User` model**
```javascript
{
  phone: { type: String, unique: true, sparse: true },  // NEW FIELD
  phoneVerified: { type: Boolean, default: false },       // NEW FIELD
  // ... existing fields remain
}
```

**New Model: `OtpSession`**
```javascript
{
  phone: String (required),
  otp: String (required, 6 digits),
  expiresAt: Date (required, 5 min TTL),
  attempts: Number (default: 0),
  verified: Boolean (default: false),
  createdAt: Date
}
```
- Index on `phone + createdAt` for cleanup
- TTL index on `expiresAt` for auto-deletion

#### 5.3.3 API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/auth/phone/otp-send` | Send OTP to phone number |
| `POST` | `/api/auth/phone/otp-verify` | Verify OTP, return session |
| `POST` | `/api/auth/phone/otp-login` | Complete login after OTP verification |

#### 5.3.4 UI Changes

**New Page: `/login/phone`**
- Phone number input with country code (+91)
- "Send OTP" button
- OTP input field (6 digits)
- "Verify & Login" button

**Modify: `/login/page.tsx`**
- Add "Login with Phone" button/link alongside existing email login

**Modify: `/register/page.tsx`**
- Add "Register with Phone" option

#### 5.3.5 OTP Generation & Verification
- Generate 6-digit random OTP
- Store hashed OTP in `OtpSession` (bcrypt or SHA-256)
- Set 5-minute expiry
- Max 3 verification attempts per OTP
- Rate limit: max 3 OTP requests per phone per 10 minutes

#### 5.3.6 SMS Integration (Firebase Auth)

```typescript
// Server-side: Generate custom token, client verifies with Firebase
// OR: Use MSG91 direct API

// MSG91 approach:
const sendOTP = async (phone: string, otp: string) => {
  const response = await fetch('https://api.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: {
      'authkey': process.env.MSG91_AUTH_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      mobile: `91${phone}`,
      otp: otp,
      template_id: process.env.MSG91_TEMPLATE_ID, // Pre-approved template
    }),
  });
  return response.json();
};
```

### 5.4 Effort Estimate
- **Firebase Auth setup:** 2-3 hours
- **OTP model + API routes:** 4-6 hours
- **UI pages (login/register):** 3-4 hours
- **Session integration with NextAuth:** 2-3 hours
- **Mobile app integration:** 4-6 hours
- **Total:** ~16-22 hours

---

## 6. Feature 4: Email-to-Phone Migration Analysis

### 6.1 Current State
- **User model:** `email` (required, unique), no `phone` field
- **Seeker model:** `phone` (required), `email` (optional)
- **All auth:** Email-based (password, magic link, OAuth)
- **All communication:** Email-based (notifications, outreach, invitations)

### 6.2 Pros of Migrating to Phone Primary

| Pro | Explanation |
|-----|-------------|
| Higher engagement | Phone notifications have ~90% open rate vs ~20% for email |
| Better for Indian users | Many users don't check email regularly |
| Enables WhatsApp integration | Phone number is the key for WhatsApp Business API |
| Simpler onboarding | No need to remember password, just OTP |
| Better for volunteer coordination | Quick phone calls and WhatsApp messages |
| Event reminders | SMS/WhatsApp reminders are more effective |

### 6.3 Cons & Pitfalls of Migrating

| Con | Explanation | Mitigation |
|-----|-------------|------------|
| **Data migration** | Existing users have email but no phone | Run a migration campaign asking users to add phone |
| **Email-dependent features** | Magic link, password reset, OAuth all use email | Keep email as secondary, add phone as primary |
| **OTP costs** | SMS costs money (even if small) | Use free tier (Firebase 10K/month), fallback to WhatsApp |
| **Phone number changes** | Users may change phone numbers | Allow updating phone with OTP verification |
| **International numbers** | Some users may have non-Indian numbers | Support international format (+1, +44, etc.) |
| **Duplicate accounts** | Same user might have email + phone entries | Deduplication logic needed |
| **Privacy** | Phone numbers are more sensitive than emails | Strong data protection, mask in admin views |

### 6.4 Recommended Migration Strategy

**Phase 1: Add Phone as Secondary (Non-Breaking)**
- Add `phone` field to User model (optional)
- Add "Login with Phone" option alongside email login
- Allow users to link phone to their existing account
- No changes to email-based flows

**Phase 2: Make Phone Primary**
- New users register with phone (email optional)
- Login defaults to phone OTP
- Email becomes secondary (for password reset, notifications)
- Existing users prompted to add phone number

**Phase 3: Email as Backup Only**
- Phone is the primary identifier
- Email is optional (for admin notifications only)
- All user-facing communication via SMS/WhatsApp

### 6.5 Communication Flow Changes

| Current (Email) | Future (Phone) |
|-----------------|----------------|
| Event registration confirmation → Email | → SMS + WhatsApp |
| Volunteer request status → Email | → SMS + WhatsApp |
| Event reminders → Email | → SMS + WhatsApp |
| Seeker follow-up alerts → Email | → SMS + WhatsApp |
| Password reset → Email | → OTP via SMS |
| Admin notifications → Email | → Email (keep as-is) |

### 6.6 Migration Checklist
- [ ] Add `phone` field to User model
- [ ] Implement phone OTP auth (Feature 3)
- [ ] Add phone linking flow for existing users
- [ ] Update email templates to include SMS/WhatsApp alternatives
- [ ] Add WhatsApp Business API integration (optional)
- [ ] Create data migration script to prompt users for phone
- [ ] Update all API routes that use `email` as user identifier
- [ ] Add phone-based user lookup alongside email lookup
- [ ] Deduplication logic for users with same phone/email

---

## 7. Feature 5: Contact Invitation System

### 7.1 Problem Statement
Volunteers should be able to invite their contacts (from phone contacts) to join as volunteers. When an invitation is sent, the contact should be pre-created in the user table with role "Volunteer", and when they actually register, their profile should be completed.

### 7.2 Current System
The existing volunteer invite system (`/volunteer-invites`) generates a one-time link that upgrades an existing User to Volunteer. This is different — the new feature should:
1. Allow volunteers to send invitations to phone contacts
2. Auto-create a User entry with role "Volunteer" (pending activation)
3. Send SMS/WhatsApp invitation with a registration link
4. When the contact clicks the link and registers, their profile gets completed

### 7.3 Mobile App Integration

The mobile app already has a detailed volunteer invite architecture in `VOLUNTEER-INVITE-ARCHITECTURE.md`:

#### Current Mobile App Issues Identified
1. **Auth state not refreshed:** App session doesn't update role after invite accept
2. **Form data discarded:** Backend route doesn't read request body
3. **Duplicate invite screens:** App has multiple invite flows

#### Target Architecture (from VOLUNTEER-INVITE-ARCHITECTURE.md)
```
[Volunteer/Admin, app or web]
  POST /api/volunteer-invites          → role gate + per-user active cap
  → { token, expiresAt: now+7d }       → share: https://sahajayogatelangana.org/invite/<token>

[Invitee opens link]
  ├─ App installed → Universal/App Link opens app at /invite/<token>
  ├─ Mobile browser → web /invite/[token] page
  └─ Cold app start  → sytelangana://invite/<token>

Unified accept screen:
  1. GET /api/volunteer-invites/<token>          → active | used | expired | not_found
  2. Not signed in → sign in/register, token preserved
  3. role is Volunteer/Admin → "already a volunteer"
  4. Otherwise → VOLUNTEER FORM (phone, city, language, interests)
  5. POST /api/volunteer-invites/<token> {form data}
     Server: claim invite → upsert VolunteerProfile → set role="Volunteer"
  6. App: refreshSession() with returned user
```

### 7.4 Detailed Requirements

#### 7.4.1 New Model: `ContactInvitation`
```javascript
{
  invitedBy: ObjectId (ref User),
  invitedByName: String,
  contactName: String (required),
  contactPhone: String (required),
  contactEmail: String (optional),
  status: String (enum: "pending", "accepted", "expired"),
  invitedUserId: ObjectId (ref User),
  token: String (unique),
  expiresAt: Date,
  sentVia: String (enum: "sms", "whatsapp", "manual"),
  createdAt: Date,
  acceptedAt: Date
}
```

#### 7.4.2 API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/contact-invitations` | Send invitation to a contact |
| `GET` | `/api/contact-invitations` | List my sent invitations |
| `GET` | `/invite/contact/[token]` | Public landing page for invitation |
| `POST` | `/invite/contact/[token]` | Complete registration from invitation |

### 7.5 Effort Estimate
- **Model + API routes:** 4-5 hours
- **UI (volunteer page + invite landing):** 4-5 hours
- **SMS/WhatsApp integration:** 3-4 hours
- **Mobile app integration:** 6-8 hours
- **Total:** ~17-22 hours

---

## 8. Feature 6: Volunteer Event Request Workflow

### 8.1 Problem Statement
Volunteers should be able to request events from within the app (from the events page). The requested event should be visible to other volunteers for review. Once approved by admin, the event should be listed publicly.

### 8.2 Current System
The existing event request system already has most of this:
- Users can submit event requests via `POST /api/event-requests`
- Admin reviews at `/admin/event-requests` and approves/rejects
- On approval, an Event is auto-created

### 8.3 Gaps to Fill

| Gap | Current | Required |
|-----|---------|----------|
| **Visibility to volunteers** | Only admin sees requests | Volunteers should see pending/approved requests |
| **Requester can edit** | No edit capability | Requester should edit their own requests |
| **Requester tracking** | No tracking of seekers added during event | Requester can see seekers added during their event |
| **Event page integration** | Event request is a separate form | Request form should be accessible from the events page |

### 8.4 Detailed Requirements

#### 8.4.1 Visibility to Volunteers

**New API: `GET /api/event-requests` (for logged-in users)**
- Return event requests where:
  - `userId` matches current user (my requests)
  - `status` is "Approved" (visible to all volunteers)
- Exclude "Rejected" requests from public view

**New Page/Section: `/events` page**
- Add "My Event Requests" section for logged-in users
- Show their own requests with status (Pending/Approved/Rejected)
- Show approved events from other volunteers

#### 8.4.2 Requester Can Edit

**New API: `PATCH /api/event-requests/[id]` (for requester)**
- Only the requester (`userId` matches) can edit
- Only "Pending" requests can be edited
- Allowed fields: eventName, description, proposedStartDate, proposedEndDate, time, location, googleMapLink, contactDetails, prices, image, qrImage, additionalNotes

**UI: Event request form with edit mode**
- Pre-fill form when editing
- Show status badge (Pending/Approved/Rejected)
- Disable fields that can't be edited after approval

#### 8.4.3 Seeker Tracking for Event

**New Model Field: `Event.requesterId`**
```javascript
{
  requesterId: ObjectId (ref User),
  requesterName: String,
}
```

**New API: `GET /api/events/[id]/seekers`**
- Return all seekers where `eventInterest` matches the event title (or `source` contains the event name)
- Only accessible to the event requester and admins

**UI: Event detail view for requester**
- Show list of seekers who registered for this event
- Show follow-up status for each seeker
- Export option (CSV)

### 8.5 Effort Estimate
- **Model changes:** 2-3 hours
- **API routes (list, edit, seekers):** 5-6 hours
- **UI changes (events page, request form, tracking):** 6-8 hours
- **Mobile app integration:** 8-10 hours
- **Total:** ~21-27 hours

---

## 9. Feature 7: Event Tracking for Requester

### 9.1 Problem Statement
The volunteer who requested an event should be able to:
1. Edit the event details (before approval)
2. Track seekers who were added during that event
3. See the follow-up status of those seekers

### 9.2 Detailed Requirements

#### 9.2.1 Link Seekers to Events
Seekers are linked to events via:
- `seeker.eventInterest` field (matches event title)
- `seeker.source` field (e.g., "Event Registration: <event name>")

#### 9.2.2 Seeker Tracking Dashboard

**New Page: `/dashboard/my-events/[eventId]`**
- Event details (title, date, location)
- List of seekers registered for this event
- For each seeker: name, phone, follow-up status, last contact date
- Action buttons: Call, WhatsApp (if volunteer), update follow-up status
- Export to CSV

#### 9.2.3 Event Requester Dashboard

**New Section: `/dashboard/my-events`**
- List of all events requested by the current user
- For each event: title, date, status, seeker count
- Quick link to view seekers for each event

### 9.3 Effort Estimate
- **API routes:** 3-4 hours
- **UI pages:** 5-6 hours
- **Mobile app integration:** 6-8 hours
- **Total:** ~14-18 hours

---

## 10. Gap Analysis & Open Questions

### 10.1 Gaps in Current Requirements

| # | Gap | Recommendation |
|---|-----|----------------|
| 1 | **WhatsApp Business API** | Need to decide: use WhatsApp Business API (paid, ₹0.50-1 per message) or simple `wa.me` links (free, but no delivery tracking)? |
| 2 | **Phone number validation** | Should we support international numbers (+1, +44) or only Indian (+91)? |
| 3 | **User deduplication** | If a user registers with email and later adds phone, how to handle duplicates? |
| 4 | **OTP expiry & retry limits** | Standard: 5-min expiry, 3 max attempts, 10-min cooldown between requests |
| 5 | **File storage for uploads** | Need to decide: MongoDB (simple), Cloudinary (recommended), or S3 (enterprise)? |
| 6 | **Event seeker linking** | Should seekers be linked to events by title match (loose) or by a dedicated `eventId` field (strict)? |
| 7 | **Volunteer contact masking** | Should non-volunteers see masked phone (98XXXXXX10) or no phone at all? |
| 8 | **Multi-language support** | OTP messages, invitation messages — should they be in Telugu/Hindi? |
| 9 | **Rate limiting** | Need to define rate limits for OTP, invitations, event requests |
| 10 | **Audit trail** | Should all status changes (event approval, seeker assignment) be logged? |

### 10.2 Open Questions for Product Owner

1. **WhatsApp Integration:** Do you want to use WhatsApp Business API (paid but trackable) or simple `wa.me` links (free but no tracking)?
2. **Phone Number Format:** Should we support only Indian numbers (+91) or international numbers too?
3. **File Storage:** Where should uploaded documents be stored? (MongoDB = simple, Cloudinary = recommended)
4. **Event-Seeker Linking:** Should seekers be strictly linked to events via `eventId`, or loosely via title matching?
5. **OTP Provider:** Firebase Auth (free, Google dependency) or MSG91 (India-focused, cheap)?
6. **Communication Language:** Should SMS/WhatsApp messages be in Telugu, Hindi, or English?

---

## 11. Technical Architecture Notes

### 11.1 Authentication Architecture
```
Current (Web):   Email + Password → NextAuth Session
Current (Mobile): Email + Password → Custom JWT token

Future (Both):   Phone + OTP → Session (phone as primary identifier)
                 Email + Password → Session (secondary)
                 Google OAuth → Session (unchanged)
```

### 11.2 Database Schema Changes

**User Model Additions:**
```javascript
{
  phone: { type: String, unique: true, sparse: true },
  phoneVerified: { type: Boolean, default: false },
  // email becomes optional for new users (required for existing)
}
```

**Event Model Additions:**
```javascript
{
  requesterId: { type: ObjectId, ref: "User" },
  requesterName: { type: String },
}
```

**New Collections:**
- `otpsessions` — OTP verification sessions
- `documentuploads` — Uploaded documents for manual OCR
- `contactinvitations` — Volunteer contact invitations

### 11.3 API Route Summary

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/auth/phone/otp-send` | POST | Send OTP | Public |
| `/api/auth/phone/otp-verify` | POST | Verify OTP | Public |
| `/api/auth/phone/otp-login` | POST | Complete login | Public |
| `/api/document-uploads` | POST | Upload document | Auth (Yogi+) |
| `/api/auth/admin/document-uploads` | GET | List uploads | Admin |
| `/api/auth/admin/document-uploads/[id]` | PATCH | Mark processed | Admin |
| `/api/contact-invitations` | POST | Send invitation | Auth (Volunteer) |
| `/api/contact-invitations` | GET | List my invitations | Auth (Volunteer) |
| `/invite/contact/[token]` | GET | Invitation landing | Public |
| `/invite/contact/[token]` | POST | Complete registration | Public |
| `/api/event-requests` | GET | List my requests | Auth |
| `/api/event-requests/[id]` | PATCH | Edit my request | Auth (owner) |
| `/api/events/[id]/seekers` | GET | Seekers for event | Auth (owner/Admin) |
| `/api/yogi-seeker-followups` | GET | Masked for non-volunteers | Auth |

---

## 12. Implementation Priority & Phasing

### Phase 1: Quick Wins (1-2 weeks)
| Feature | Effort | Impact | Status |
|---------|--------|--------|--------|
| Document Upload (replace OCR) | 4-5 hrs | High — fixes unreliable OCR | ✅ Complete |
| Lock Seeker Contact | 3-4 hrs | High — privacy & access control | ✅ Web / 🔄 Mobile |
| **Total** | **7-9 hrs** | | |

### Phase 2: Phone Auth (2-3 weeks)
| Feature | Effort | Impact | Status |
|---------|--------|--------|--------|
| Phone OTP Authentication | 16-22 hrs | High — better onboarding | Not started |
| Email-to-Phone Migration (Phase 1) | 8-10 hrs | Medium — non-breaking | Not started |
| **Total** | **24-32 hrs** | | |

### Phase 3: Events & Invitations (2-3 weeks)
| Feature | Effort | Impact | Status |
|---------|--------|--------|--------|
| Volunteer Event Request Workflow | 21-27 hrs | High — volunteer empowerment | Not started |
| Event Tracking for Requester | 14-18 hrs | Medium — visibility | Not started |
| Contact Invitation System | 17-22 hrs | Medium — growth | Designed |
| **Total** | **52-67 hrs** | | |

### Phase 4: Polish & Migration (1-2 weeks)
| Feature | Effort | Impact | Status |
|---------|--------|--------|--------|
| Email-to-Phone Migration (Phase 2-3) | 10-15 hrs | Medium — full migration | Not started |
| Data deduplication | 4-6 hrs | Low — cleanup | Not started |
| **Total** | **14-21 hrs** | | |

### Grand Total: ~97-129 hours (approximately 13-17 working days)

---

## 13. Mobile App Integration Notes

### 13.1 Mobile App Already Has

The mobile app (`SahajaYogaTelangana_APP`) already has extensive planning:

#### BRD.md — Phase 2 Features
- **Onboarding & Profile:** Phone OTP auth, profile picture upload, multi-language selection
- **Seeker Management:** Seeker dashboard, batch operations, offline support
- **Notifications:** Push notifications, event reminders, follow-up alerts
- **Journal & Reflections:** Meditation journal, experience sharing
- **Festival Integration:** Festival calendar, special event tracking

#### ENGINEERING-PLAN.md — 8 Sprints (~8 weeks)
| Sprint | Focus | Est. Days |
|--------|-------|:---------:|
| S1 | Accessibility & Consistency | 3 |
| S2 | Design System Tokens | 4 |
| S3 | Feedback & Micro-interactions | 4 |
| S4 | Profile & Seeker Refactor | 5 |
| S5 | Meditation & Centres | 4 |
| S6 | Offline, Notifications & Polish | 5 |
| S7 | Advanced Features | 4 |
| S8 | Volunteer Vetting & Seeker Data Protection | 4 |

#### VOLUNTEER-INVITE-ARCHITECTURE.md — Detailed Design
- Root-cause analysis of current invite system issues
- Target architecture with atomic single-use claims
- Security analysis (11 threats mitigated)
- File impact matrix for both web and mobile
- Phased implementation plan

### 13.2 Coordination Required

When implementing features from this document, coordinate with the mobile app's existing plans:

1. **Phone OTP Auth (Feature 3):**
   - Mobile app already has auth store pattern in `src/stores/auth.store.ts`
   - Add `refreshSession()` method to sync role from server
   - Update `src/app/(auth)/login.tsx` to support phone OTP

2. **Contact Invitation (Feature 5):**
   - Follow `VOLUNTEER-INVITE-ARCHITECTURE.md` for unified flow
   - Fix auth state refresh issue in mobile app
   - Implement deep linking for invite URLs

3. **Event Tracking (Feature 7):**
   - Mobile app already has `src/app/seeker/followups.tsx`
   - Add event-based filtering to seeker dashboard
   - Implement offline support for event data

### 13.3 Files to Coordinate

| Mobile App File | Purpose | Coordination Notes |
|-----------------|---------|-------------------|
| `src/stores/auth.store.ts` | Auth state management | Add `refreshSession()` for role sync |
| `src/app/(auth)/login.tsx` | Login flow | Add phone OTP option |
| `src/app/seeker/followups.tsx` | Seeker follow-ups | Add contact locking |
| `src/app/seeker/scan-page.tsx` | Document upload | ✅ Already updated |
| `src/lib/seekers.ts` | Seeker utilities | ✅ Already updated |
| `src/lib/api.ts` | API client | May need new endpoints |

---

## Appendix A: File Impact Matrix

| Feature | Web Files | Mobile Files |
|---------|-----------|--------------|
| Document Upload | `DocumentUpload.ts`, `/admin/document-uploads/page.tsx`, `/api/document-uploads/route.ts`, `/api/auth/admin/document-uploads/route.ts`, `/add-seeker/scan/page.tsx` | `src/app/seeker/scan-page.tsx` ✅ |
| Lock Seeker Contact | `/dashboard/seeker-followups/page.tsx`, `/api/yogi-seeker-followups/route.ts` | `src/app/seeker/followups.tsx` |
| Phone OTP | `OtpSession.ts`, `/api/auth/phone/otp-send/route.ts`, `/api/auth/phone/otp-verify/route.ts`, `/login/phone/page.tsx`, `User.ts`, `/login/page.tsx`, `/register/page.tsx`, NextAuth options | `src/stores/auth.store.ts`, `src/app/(auth)/login.tsx`, `src/types/index.ts` |
| Contact Invitation | `ContactInvitation.ts`, `/api/contact-invitations/route.ts`, `/invite/contact/[token]/page.tsx`, `/volunteer/page.tsx` | `src/app/invite/[token].tsx`, `src/app/volunteer.tsx`, `src/app/(tabs)/index.tsx` |
| Event Request Edit | `EventRequest.ts`, `Event.ts`, `/api/event-requests/[id]/route.ts`, `/events/page.tsx` | `src/app/events/[id].tsx`, `src/lib/api.ts` |
| Event Tracking | `Event.ts`, `/api/events/[id]/seekers/route.ts`, new dashboard page | `src/app/seeker/dashboard.tsx`, `src/app/seeker/followups.tsx` |

---

## Appendix B: Environment Variables Needed

```env
# Phone OTP (choose one)
FIREBASE_PROJECT_ID=xxx
FIREBASE_PRIVATE_KEY=xxx
FIREBASE_CLIENT_EMAIL=xxx

# OR MSG91
MSG91_AUTH_KEY=xxx
MSG91_TEMPLATE_ID=xxx

# File Storage (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# WhatsApp Business API (optional)
WHATSAPP_API_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
```

---

*Document prepared for the SahajaYogaTelangana development team. All features are designed to work within the existing Next.js + MongoDB architecture and coordinate with the Expo/React Native mobile app.*
