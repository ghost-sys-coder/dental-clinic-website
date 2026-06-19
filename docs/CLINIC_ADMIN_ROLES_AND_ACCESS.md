# Clinic Admin Role Definitions and Access Limitations

This document defines user roles for a reusable clinic management backend.

The system should work for dental clinics, eye clinics, dermatology clinics, physiotherapy clinics, wellness clinics, and other appointment based healthcare businesses.

The goal is to protect patient data, reduce operational mistakes, and give each staff member only the access needed to perform their role.

## Core Principle

Roles describe job responsibility.

Permissions control actual access.

A good backend should not rely only on role names. It should use a central permission map so the same product can adapt to different clinic types.

## Recommended Roles

```txt
OWNER
ADMIN
CLINIC_MANAGER
PRACTITIONER
CLINICAL_ASSISTANT
RECEPTIONIST
CONTENT_EDITOR
VIEWER
```

## Role Definitions

### Owner

The Owner is the highest level account in the system.

This role belongs to the clinic owner, business owner, founder, or primary decision maker.

Use this role for:

```txt
Clinic owner
Business owner
Primary super admin
Franchise owner
Practice owner
```

Allowed access:

```txt
Full dashboard access
All leads
All appointments
All patients
All practitioners and staff
All roles and permissions
Clinic settings
Website content
Reports and analytics
Audit logs
Data export
Billing settings if available
Account creation
Role changes
Archiving and deletion controls
```

Access limitations:

```txt
None by default.
Only one or two users should have this role.
```

### Admin

The Admin manages the system and senior clinic operations.

This role belongs to a trusted administrator who needs broad access but should not control ownership level actions.

Use this role for:

```txt
Senior administrator
Operations administrator
Technical admin
Agency support account during setup
Clinic systems manager
```

Allowed access:

```txt
View dashboard
Manage leads
Assign leads
Manage appointments
Manage patients
Manage staff accounts
Create user accounts
Send account invitations
Manage services
Manage public profiles
Manage reviews
Manage website content
View analytics
Export operational data
View audit logs
Manage clinic settings
```

Access limitations:

```txt
Cannot remove the Owner.
Cannot change the Owner role.
Cannot transfer ownership.
Cannot permanently delete audit logs.
Cannot access billing settings unless explicitly allowed.
Cannot perform irreversible system actions unless explicitly allowed.
```

### Clinic Manager

The Clinic Manager runs daily clinic operations.

Use this role for:

```txt
Practice manager
Branch manager
Operations manager
Senior receptionist
Clinic supervisor
```

Allowed access:

```txt
View operational dashboard
View all leads
Update lead statuses
Assign leads to practitioners
Create appointments
Update appointment statuses
Reschedule appointments
Cancel appointments
View patient profiles
Update basic patient details
Add administrative notes
View practitioner schedules
View overdue follow ups
View daily calendar
View basic reports
Export lead and appointment lists
```

Access limitations:

```txt
Cannot create admin accounts.
Cannot change user roles.
Cannot manage ownership settings.
Cannot manage billing settings.
Cannot delete patients.
Cannot delete audit logs.
Cannot change security settings.
Cannot access full system configuration unless allowed.
```

### Practitioner

The Practitioner handles consultations, treatment, diagnosis, and patient care.

This is the broad replacement for dentist. In different clinic types, this role can represent a dentist, optometrist, ophthalmologist, dermatologist, physiotherapist, general doctor, therapist, surgeon, or specialist.

Use this role for:

```txt
Dentist
Optometrist
Ophthalmologist
Dermatologist
Physiotherapist
General doctor
Specialist doctor
Therapist
Consultant
Surgeon
```

Allowed access:

```txt
View personal dashboard
View assigned leads
View assigned appointments
View assigned patients
Update assigned appointment status
Add clinical notes
Add treatment notes
Add follow up recommendations
Request reschedules
View relevant patient history
Receive assignment notifications
Receive appointment reminders
Mark assigned appointments as completed
```

Access limitations:

```txt
Cannot view all clinic leads unless allowed.
Cannot view patients not assigned to them unless allowed.
Cannot assign leads to other practitioners.
Cannot create staff accounts.
Cannot manage team roles.
Cannot manage website content.
Cannot edit clinic settings.
Cannot export full clinic data.
Cannot delete patient records.
Cannot view financial analytics unless allowed.
```

### Clinical Assistant

The Clinical Assistant supports care delivery under a practitioner.

This is the broad replacement for hygienist. In different clinic types, this role can represent a dental hygienist, nurse, optometry assistant, physiotherapy assistant, clinical aide, or lab assistant.

Use this role for:

```txt
Dental hygienist
Nurse
Optometry assistant
Ophthalmic assistant
Physiotherapy assistant
Clinical aide
Lab assistant
Procedure assistant
```

Allowed access:

```txt
View assigned appointments
View assigned patients
View daily clinical schedule
Update appointment progress
Add support notes
Add preparation notes
Add follow up reminders
View patient alerts relevant to care
Mark support tasks as completed
```

Access limitations:

```txt
Cannot view all leads.
Cannot assign leads.
Cannot manage appointments outside assigned schedule unless allowed.
Cannot create staff accounts.
Cannot manage user roles.
Cannot manage services.
Cannot manage website content.
Cannot access full analytics.
Cannot export patient data.
Cannot change clinic settings.
Cannot delete records.
```

### Receptionist

The Receptionist handles front desk workflow, bookings, and patient communication.

Use this role for:

```txt
Front desk staff
Call handler
Appointment coordinator
Customer support staff
Patient intake staff
```

Allowed access:

```txt
View leads
Create leads manually
Update lead contact status
Create appointments
Confirm appointments
Reschedule appointments
Cancel appointments
Check in patients
Mark no show
View patient contact details
Update basic patient details
Add administrative notes
Send appointment reminders
View daily calendar
View practitioner availability
```

Access limitations:

```txt
Cannot view sensitive clinical notes unless allowed.
Cannot write clinical notes.
Cannot change practitioner roles.
Cannot create admin accounts.
Cannot manage services.
Cannot manage website content.
Cannot view full analytics.
Cannot export all patient data unless allowed.
Cannot delete patient records.
Cannot access system settings.
Cannot view audit logs unless allowed.
```

### Content Editor

The Content Editor manages the public facing website content.

Use this role for:

```txt
Marketing staff
Content manager
SEO person
Agency user
Website editor
Social media assistant
```

Allowed access:

```txt
Manage service pages
Manage practitioner public profiles
Manage testimonials
Manage case studies
Manage before and after cases where applicable
Manage FAQ items
Manage homepage content
Manage images
Manage SEO metadata
Manage blog content if available
Preview published pages
```

Access limitations:

```txt
Cannot view leads.
Cannot view appointments.
Cannot view patients.
Cannot view practitioner schedules.
Cannot assign leads.
Cannot create staff accounts.
Cannot change roles.
Cannot access clinic operations.
Cannot export patient or lead data.
Cannot view audit logs involving patients.
```

### Viewer

The Viewer has limited read only access.

Use this role for:

```txt
Auditor
External reviewer
Business partner
Investor with limited access
Temporary stakeholder
Read only staff account
```

Allowed access:

```txt
View selected dashboard sections
View selected reports
View selected leads if permitted
View selected appointments if permitted
View selected content if permitted
View team profiles
```

Access limitations:

```txt
Cannot create records.
Cannot edit records.
Cannot delete records.
Cannot assign leads.
Cannot update appointment statuses.
Cannot manage users.
Cannot export data unless explicitly allowed.
Cannot access settings.
Cannot send notifications.
Cannot manage website content.
```

## Permission Groups

Use permission groups instead of scattering role checks throughout the application.

### Lead Permissions

```txt
lead.view_all
lead.view_assigned
lead.create
lead.update
lead.assign
lead.archive
lead.export
```

### Appointment Permissions

```txt
appointment.view_all
appointment.view_assigned
appointment.create
appointment.update
appointment.confirm
appointment.cancel
appointment.reschedule
appointment.check_in
appointment.mark_no_show
appointment.complete
```

### Patient Permissions

```txt
patient.view_all
patient.view_assigned
patient.create
patient.update_basic
patient.update_sensitive
patient.archive
patient.export
```

### Clinical Permissions

```txt
clinical_note.view
clinical_note.create
clinical_note.update_own
clinical_note.update_all
clinical_note.delete
```

### Staff Permissions

```txt
staff.view
staff.create
staff.update
staff.archive
staff.manage_roles
```

### Content Permissions

```txt
content.view
content.create
content.update
content.publish
content.archive
```

### Settings Permissions

```txt
settings.view
settings.update_clinic
settings.update_branding
settings.update_notifications
settings.update_security
settings.update_billing
```

### Analytics Permissions

```txt
analytics.view_basic
analytics.view_full
analytics.export
```

### Audit Permissions

```txt
audit.view
audit.export
```

## Recommended Access Rules

### Patient Data Rule

Only clinical and operational roles should access patient data.

Allowed:

```txt
Owner
Admin
Clinic Manager
Practitioner
Clinical Assistant
Receptionist with limited fields
```

Blocked by default:

```txt
Content Editor
Viewer
```

### Clinical Notes Rule

Only clinical users should write clinical notes.

Allowed:

```txt
Practitioner
Clinical Assistant
Owner if needed
Admin only if clinically authorized
```

Blocked:

```txt
Receptionist
Content Editor
Viewer
```

### Lead Assignment Rule

Only operational leadership should assign leads.

Allowed:

```txt
Owner
Admin
Clinic Manager
```

Blocked:

```txt
Practitioner unless allowed
Clinical Assistant
Receptionist
Content Editor
Viewer
```

### Appointment Control Rule

Front desk and operations staff should manage scheduling.

Allowed:

```txt
Owner
Admin
Clinic Manager
Receptionist
```

Limited:

```txt
Practitioner can update assigned appointment progress.
Clinical Assistant can update assigned appointment progress.
```

Blocked:

```txt
Content Editor
Viewer
```

### Website Content Rule

Only content roles should edit public website content.

Allowed:

```txt
Owner
Admin
Content Editor
```

Blocked:

```txt
Practitioner
Clinical Assistant
Receptionist
Viewer
```

### Account Creation Rule

Only senior system roles should create user accounts.

Allowed:

```txt
Owner
Admin
```

Blocked:

```txt
Clinic Manager
Practitioner
Clinical Assistant
Receptionist
Content Editor
Viewer
```

### Role Change Rule

Only top level users should change roles.

Allowed:

```txt
Owner
Admin with restrictions
```

Blocked:

```txt
Everyone else
```

Admin should not be allowed to create, remove, or modify an Owner.

### Delete Rule

Avoid hard deletes.

Use archive instead.

Allowed hard delete:

```txt
Owner only
```

Allowed archive:

```txt
Owner
Admin
Clinic Manager for operational records
```

Blocked:

```txt
Practitioner
Clinical Assistant
Receptionist
Content Editor
Viewer
```

## Clinic Type Examples

### Dental Clinic

Practitioner means dentist, orthodontist, oral surgeon, pediatric dentist, or cosmetic dentist.

Clinical Assistant means hygienist or dental assistant.

Services may include general dentistry, implants, crowns, whitening, orthodontics, root canal therapy, oral surgery, and emergency care.

### Eye Clinic

Practitioner means optometrist, ophthalmologist, eye surgeon, or vision specialist.

Clinical Assistant means ophthalmic assistant, optical technician, or nurse.

Services may include eye exams, prescription glasses, contact lenses, cataract consultation, glaucoma screening, dry eye care, and vision therapy.

### Dermatology Clinic

Practitioner means dermatologist, cosmetic specialist, or skin therapist.

Clinical Assistant means nurse, procedure assistant, or aesthetic assistant.

Services may include acne treatment, mole checks, skin cancer screening, laser treatment, chemical peels, and cosmetic consultations.

### Physiotherapy Clinic

Practitioner means physiotherapist, sports therapist, rehabilitation specialist, or chiropractor.

Clinical Assistant means therapy assistant or rehab aide.

Services may include injury recovery, sports rehab, posture correction, back pain treatment, mobility training, and post surgery rehabilitation.

## Recommended Role Enum

Use these role values in the database:

```txt
OWNER
ADMIN
CLINIC_MANAGER
PRACTITIONER
CLINICAL_ASSISTANT
RECEPTIONIST
CONTENT_EDITOR
VIEWER
```

## Database Naming Guidance

Build the product around generic clinic operations, not around one clinic type.

Use generic terms in the database:

```txt
practitioners instead of dentists
patients instead of clients
services instead of treatments only
appointments instead of bookings only
clinical_notes instead of dental_notes
case_studies instead of dental_cases
```

## Final Rule

Build the backend once for generic clinic operations.

Customize clinic type through services, content, practitioner titles, and frontend labels.

Do not hardcode dental specific assumptions into the database or permission system.
