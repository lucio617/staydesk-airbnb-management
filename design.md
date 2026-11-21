# Staydesk design system

## Purpose
A private, mobile-friendly guest register and booking manager for a host. Manual entry is the primary workflow. One booking has multiple guests, each with their own details and attachments.

## Visual direction
Airbnb-inspired light interface, coral primary actions, charcoal text, white cards, restrained shadows and generous rounded corners. Reference: https://design.hagicode.com/designs/airbnb/
Use original Staydesk branding. Keep operational information prominent. DM Sans with system sans-serif fallback.
Primary #e8214c; text #222222; muted #737373; borders #eaeaea; soft accent #fff0f2.
Body inputs 16px on mobile, touch controls 44px or taller, visible focus, reduced-motion support.

## Booking register
After sign-in, show one searchable table ordered by check-in date, newest first. Guest names open complete booking records. On phones, prioritize guest name, check-in and check-out.

## Booking form
One scrollable modal contains four sections: Stay details, Your guests, Documents, Payment.
Stay: lead guest, phone, optional email, property, room count (1/2/3), room numbers, check-in/out dates and times, source/reference, arriving from, purpose, notes, stay status, room readiness.
Guests: repeatable name, age, optional gender, address, ID type, document consent.
Documents: guest-specific JPG/PNG/PDF, 8 MB maximum, pending uploads, authenticated download and deletion.
Payment: total, amount paid, method; calculate remaining balance. Currency INR.
Store dates/times in property local time (Asia/Kolkata for this version). Guest count derives from guest cards.
Keep all fields available while scrolling and confirm discarding edits or deleting records.

## Storage and access
Server-side account authorization on every API operation. D1 for booking records, R2 for documents. No browser storage of guest records. Private platform access plus user ownership checks. No raw Aadhaar number field. Record consent before uploading ID copies.
