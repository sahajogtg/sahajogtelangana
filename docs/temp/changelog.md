# Changelog

## [Unreleased] - 2023-03-25

### Fixed

- Fixed PDF generation in production environment
  - Replaced Puppeteer with jsPDF for serverless-compatible PDF generation
  - Resolved 500 errors when downloading receipts in production
  - Maintained the same visual design and information structure
- Fixed missing email field in bulk registration API by adding it to the registration object creation
- Fixed login redirect issue by properly implementing password comparison in the NextAuth.js authorize callback
- Enhanced login page to handle authentication errors and provide better feedback
- Added debug route to help diagnose authentication issues
- Replaced placeholder logos in About Us section with actual photos of Shri Mataji
  - Added circular photo frames with styled borders and subtle background
  - Used relevant images for both Shrine Chhindwara and Sahaja Yoga sections

### Added

- Added direct PDF download functionality for registration receipts
  - Created server-side PDF generation API using Puppeteer
  - Added PDF download buttons to both registration and receipt download pages
  - Implemented well-formatted PDF receipts with proper styling
  - Supported both individual and bulk registration receipts
- Created a dedicated page for downloading registration receipts using transaction numbers
  - Added API endpoint to fetch registrations by transaction number or name
  - Implemented a user-friendly interface with search by transaction number or name
  - Displays both individual and bulk registrations with all details
  - Added print/download functionality for receipts
  - Added option to email receipt directly from the download page
- Added validation to prevent duplicate registrations
  - Added checks for duplicate transaction numbers
  - Added checks for duplicate name within the same event
  - Enhanced error handling to provide clear messages about duplicate entries
- Created documentation for the authentication system
- Added improved error handling for login failures
- Implemented Events feature:
  - Added MongoDB Event model
  - Created API endpoints for event management
  - Built frontend component to display upcoming events on homepage
  - Developed admin interface for event management with CRUD operations
- Added "Upcoming Events" link to main navigation
- Added sample event "Shri Krishna Puja 2025" to demonstrate the events feature
- Enhanced admin event registrations page:
  - Implemented Excel export functionality for event registrations
  - Added filtering capability by event
- Added Admin Dashboard link to navigation bar for users with Admin role
- Added bulk registration capability for events:
  - Ability to register multiple participants with a single transaction
  - Dynamic calculation of total amount based on all participants' ages
  - Enhanced receipt to display all registered participants
  - Improved UI with participant management (add, edit, remove)
- Added bank transfer details to the event registration payment section:
  - Account holder: H.H SHRI MATAJI NIRMALA DEVI SAHAJA YOGA TRUST
  - Account details: Union Bank of India with account number and IFSC code
  - Branch information: IRC Village, Bhubaneswar

### Changed

- Modified login flow to use `redirect: false` with NextAuth signIn to allow for better error handling
- Updated login page to manually handle redirection after successful login
- Updated admin layout to include Events navigation item
- Enhanced Events component to display sample events when no events are returned from API
- Updated the Virtual Tour section with official Sahaja Yoga shrine video 
- Updated Benefits section background to match the Hero section's red-pink-orange gradient
- Added "SahajaYoga Odisha" styled text to the event banner section for brand identity
- Created new Contact Us section with vibrant red-pink-orange gradient to match site theme
- Removed duplicate contact form (GetApp component) to avoid redundancy
- Removed top navigation bar containing phone number, email, and "Request for Stay" button
- Enhanced Benefits section with modern card design, decorative elements, and improved styling
- Updated all green text and backgrounds to maroon (#8A1457) for consistent branding throughout the site
- Added admin user creation functionality with credentials (admin@sahaj.com / admin)
- Enhanced admin creation page to accept custom email and password
- Fixed text visibility issue in login form input fields
- Updated event registration pricing:
  - Reduced fee for adults (25 years and above) from ₹2,800 to ₹2,600
  - Maintained child fee (below 12 years) at ₹1,000
  - Maintained youth fee (12 to 24 years) at ₹1,800

## 2023-09-XX
- Initial project setup
- Created base project structure
- Set up MongoDB connection

## 2023-09-XX
- Added Event model for database
- Created Admin dashboard interface
- Implemented Event CRUD operations

## 2023-09-XX
- Created Events page to display upcoming events
- Implemented UI for event cards

## 2023-09-XX
- Made event cards clickable to navigate to registration
- Created registration form for events
- Implemented API endpoint for event registrations (/api/event-registrations)
- Created admin interface to view and filter event registrations (/admin/event-registrations)
- Added Event Registrations link to admin navigation 

## 2023-09-XX
- Fixed QR code display in registration form (corrected file extension from .jpg to .png)
- Increased QR code image size for better visibility
- Further enlarged QR code size to improve usability 
- Implemented registration receipt generation after successful submission
- Added options to download receipt or receive via email
- Created API endpoint for email delivery of receipts
- Fixed MongoDB connection in email receipt API
- Implemented actual email sending using Nodemailer with HTML receipt template
- Added event banner at the top of the home page with slider functionality
- Fixed event navigation to properly link to the top event banner
- Restored sample event (Krishna Puja 2025) to ensure banner always shows an event
- Implemented new theme styling inspired by Sahaja Yoga Shrine website
  - Added maroon/purple primary color (#8A1457)
  - Added gold secondary color (#E39321)
  - Updated header with contact info and navigation
  - Added footer donation and registration links
  - Restyled all buttons and UI components to match theme
- Updated hero section with vibrant full-width gradient background
  - Changed from green to red-pink-orange gradient
  - Improved responsive layout
  - Added circular image container for Shri Mataji's photo
- Changed site background color to match Shrine website's beige/cream color (#FEF5E7)
- Added "About Us" section with dual cards layout
- Added "Virtual Tour" section with embedded video 
- Updated the Virtual Tour section with official Sahaja Yoga shrine video 
- Added Excel export functionality to admin event registrations page
  - Allows downloading all registrations or filtered by event
  - Includes all registration details in a formatted spreadsheet 