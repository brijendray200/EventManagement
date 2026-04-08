# Event Management System

## Abstract
The Event Management System is a full-stack web application built to simplify the planning, promotion, booking, and administration of events. The platform allows users to browse events, review event details, make bookings, complete payments, and manage their profiles from a single interface. It also provides dedicated organizer and admin dashboards for event creation, attendee management, approvals, and operational monitoring. By digitizing the complete workflow, the system improves efficiency, reduces manual work, and offers a more reliable user experience for both organizers and attendees.

## Introduction
Managing events manually is time-consuming and often leads to errors in registration, payment tracking, and communication. This project addresses those challenges through a centralized digital platform that connects event organizers, attendees, and administrators. The application combines a React-based frontend with a Node.js and Express backend, enabling secure authentication, booking management, payment processing, notifications, and role-based access control.

## Problem Statement
Traditional event handling methods often depend on spreadsheets, phone calls, paper forms, and disconnected tools. These methods create delays, inconsistent records, and limited visibility into bookings or event performance. A modern event platform is needed to manage event listings, user registrations, organizer workflows, and payments in one connected system.

## Objectives
- Build a centralized platform for event discovery and event management.
- Allow users to register, log in, browse events, and book tickets online.
- Provide organizers with tools to create events and review attendees.
- Support secure booking confirmation and payment tracking.
- Improve communication through notifications and profile-based access.
- Reduce manual effort and improve operational accuracy.

## Scope of the Project
This system can be used by colleges, clubs, communities, startups, and commercial event organizers. It supports multiple event categories such as concerts, seminars, workshops, corporate programs, and private celebrations. The project is suitable for both academic demonstration and real-world deployment with further production hardening.

## Technology Stack
- Frontend: React, TypeScript, Vite, CSS
- Backend: Node.js, Express, TypeScript, JavaScript
- Database: MongoDB with Mongoose
- Authentication: JWT-based authentication and Google OAuth
- Payments: Razorpay webhook integration
- Additional Services: Cloudinary-style media flow, email utilities, notifications, and AI concierge support

## Core Modules

### 1. User Authentication Module
- User signup and login
- Forgot password and reset password flow
- Session restoration using tokens
- Role-based route protection for user, organizer, and admin access

### 2. Event Discovery Module
- Event listing with search and category filters
- Event detail page with images and highlights
- Dynamic event categories such as concerts, seminars, workshops, corporate events, and weddings

### 3. Booking Module
- Booking creation for selected events
- Ticket quantity handling
- Booking status tracking
- My Bookings page for attendees

### 4. Payment Module
- Payment flow linked to bookings
- Razorpay webhook verification
- Automatic booking confirmation after successful payment capture
- Ticket inventory updates after successful payment

### 5. Organizer Module
- Organizer dashboard with revenue, attendee, and active event statistics
- Create and manage events
- View attendee lists
- Place promotional ads

### 6. Admin Module
- Admin dashboard access
- Oversight of organizer and system activities
- Role-based access to high-level management functions

### 7. Notification and Profile Module
- In-app notifications for booking and payment updates
- Profile management for logged-in users
- Personalized user state stored across sessions

### 8. AI Concierge and Support Module
- AI concierge component integrated in the frontend
- Contact and support-related flows in the platform
- Extended support for engagement and assistance

## System Workflow
1. A user registers or logs in to the platform.
2. The user browses the event catalog and opens a preferred event.
3. The user selects tickets and creates a booking.
4. The payment process is completed through the integrated payment flow.
5. On successful payment capture, the booking is confirmed and ticket counts are updated.
6. Organizers create new events, manage existing ones, and review attendee lists.
7. Admin users monitor platform activity through privileged dashboards.

## Main Features
- Responsive frontend with modern navigation
- Role-based authentication and protected routes
- Event search, filtering, and detailed event pages
- Organizer dashboards and event creation
- Booking and payment confirmation workflow
- Notifications and profile management
- Ad placement support for organizers and admins
- AI concierge integration for enhanced user interaction

## Advantages
- Reduces manual effort in event coordination
- Centralizes attendee, organizer, and admin workflows
- Improves booking visibility and payment traceability
- Supports scalable event categories and user roles
- Enhances the user experience with a structured, modern interface

## Conclusion
The Event Management System is a practical and scalable platform for digital event operations. It brings event browsing, booking, payment processing, organizer tools, and administrative controls into a single application. The project demonstrates strong full-stack development concepts and delivers a clear solution to common event management challenges.

## Future Enhancements
- QR code based event check-in
- Email and SMS reminders for attendees
- Advanced analytics dashboard
- Seat selection and capacity planning
- Coupon and discount management
- Multi-language support
- Mobile app integration

## Interview Description
This project is a full-stack Event Management System developed to streamline the end-to-end event lifecycle. It allows users to discover events, book tickets, and receive booking updates, while organizers can create events, track attendees, and monitor revenue. The platform uses React for the frontend and Node.js with Express for the backend, with MongoDB for data management. A key strength of the project is its role-based architecture, payment integration, and modular structure for users, organizers, and admins.

## College Presentation Description
Good morning everyone.

Today I am presenting my project, Event Management System. This is a full-stack web application designed to simplify the process of creating, managing, and booking events. In this platform, users can register, browse event listings, check event details, and book tickets. Organizers can create new events, manage attendees, and track performance through a dedicated dashboard. The system also supports secure login, notifications, and payment confirmation. The main goal of this project is to reduce manual work, improve accuracy, and provide a smooth digital experience for event management.
