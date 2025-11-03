# Hospital Admin Portal - Full Functionality Plan

## Overview
The Hospital Admin Portal is the counterpart to the Researcher Portal. While researchers request data and post studies, hospitals manage incoming requests, control data sharing, and participate in research studies.

---

## Phase 1: Data Request Management (CORE FUNCTIONALITY)

### 1.1 View Incoming Data Access Requests
**Current Status:** ✅ Basic UI exists, needs backend integration
- Display all data access requests from researchers
- Show request details:
  - Researcher organization name
  - Request type (anonymized aggregates vs identified records)
  - Research title and purpose
  - Requested data fields
  - Sample size needed
  - IRB approval status
  - Privacy level (public results, private analysis, confidential)
  - Timeline/urgency
  - Timestamp of request

### 1.2 Review Request Details
- View full request information including:
  - ZK proof details showing researcher has valid credentials
  - Research protocol/methodology
  - Data usage terms
  - Compliance certifications
  - Expected outcomes and publication plans

### 1.3 Approve/Reject Requests
**Backend:** `/api/hospital/data-requests/:id/approve` and `/api/hospital/data-requests/:id/reject`
- Approve button:
  - Creates data sharing agreement
  - Sends notification to researcher
  - Updates request status to 'approved'
  - Logs approval in audit trail
- Reject button:
  - Optional reason for rejection
  - Sends notification to researcher
  - Updates request status to 'rejected'
  - Logs rejection in audit trail
- Pending status remains until action taken

### 1.4 Request Filtering and Search
- Filter by:
  - Status (pending, approved, rejected)
  - Organization
  - Request type
  - Date range
  - Data sensitivity level
- Search by research title or organization name

---

## Phase 2: Hospital Network Directory

### 2.1 Hospital Profile Management
**New Page:** `/hospital-admin/profile`
**Backend:** `/api/hospital/profile`

Hospital profile should include:
- **Basic Information:**
  - Hospital name
  - Location (city, state, country)
  - Hospital type (academic, community, specialty)
  - Contact information
  - Website

- **Capabilities:**
  - Research areas of expertise
  - Available data types (EHR, genomics, imaging, etc.)
  - Patient population size
  - Demographics served
  - Specialty departments

- **Data Sharing Settings:**
  - Opt-in/opt-out of public directory
  - Data sharing policies
  - Preferred collaboration types
  - Minimum requirements for partnerships

- **Verification Status:**
  - Hospital accreditation
  - Research certifications (CITI, HIPAA compliance)
  - Last verified date

### 2.2 Directory Visibility Controls
- Toggle public visibility on/off
- Control what information is visible to researchers:
  - Public: All hospitals can see full profile
  - Verified Only: Only verified researchers can see contact info
  - Private: Not listed in directory, by invitation only

### 2.3 Hospital Network Page (Researcher Side)
**Update:** `/hospital-network` page on researcher portal
- Map view of participating hospitals
- List view with filters:
  - Location
  - Hospital type
  - Research areas
  - Data types available
  - Acceptance rate
- Hospital detail cards showing:
  - Name, location, type
  - Specialties and research areas
  - Average response time
  - Number of active partnerships
  - "Request Data Access" button

---

## Phase 3: Study Request Marketplace (Hospital Side)

### 3.1 Browse Available Studies
**New Page:** `/hospital-admin/study-marketplace`
**Backend:** `/api/hospital/available-studies`

Display researcher-posted study opportunities:
- Study title and principal investigator
- Research organization
- Study type (observational, clinical trial, registry)
- Required patient criteria:
  - Age range
  - Conditions/diagnoses
  - Sample size needed from this hospital
  - Inclusion/exclusion criteria
- Compensation/funding available
- Study timeline and commitment
- IRB approval status
- Privacy guarantees (ZK proofs, anonymization)

### 3.2 Express Interest in Studies
- "Express Interest" button for each study
- Form to submit:
  - Estimated patient match count
  - Available start date
  - Points of contact at hospital
  - Questions for researcher
  - Preliminary feasibility assessment

### 3.3 Study Participation Management
**New Page:** `/hospital-admin/study-participation`
- View all studies hospital is participating in
- Track enrollment progress
- Submit data for studies
- Communicate with research teams
- View study results and publications

---

## Phase 4: Active Partnerships Dashboard

### 4.1 Partnership Overview
**Integration:** Add to main dashboard
- List of active research organizations with data sharing agreements
- Partnership metrics:
  - Number of active projects
  - Total data requests approved
  - Data shared volume
  - Publications resulting from partnership
  - Partnership duration

### 4.2 Partnership Management
**New Page:** `/hospital-admin/partnerships`
- View all partnerships (active, paused, ended)
- Partnership details:
  - Organization information
  - Current projects
  - Data sharing agreement terms
  - Communication history
  - Performance metrics
- Actions:
  - Pause partnership
  - Renegotiate terms
  - End partnership
  - Export partnership data

---

## Phase 5: Data Governance & Compliance

### 5.1 Data Access Audit Trail
**New Page:** `/hospital-admin/audit-log`
- Comprehensive log of all data access:
  - What data was accessed
  - By which organization
  - When and by whom it was approved
  - Purpose of access
  - Results/outcomes
- Export capabilities for compliance reporting
- Filter by date, organization, data type

### 5.2 Privacy & Compliance Dashboard
**New Page:** `/hospital-admin/compliance`
- HIPAA compliance status
- Data sharing agreement renewals needed
- Pending security reviews
- Privacy incident log
- Compliance certifications status
- Scheduled audits

### 5.3 Data Sharing Policies
**New Page:** `/hospital-admin/data-policies`
- Create and manage policies:
  - Auto-approve criteria (e.g., all requests from verified universities)
  - Auto-reject criteria (e.g., commercial entities)
  - Required review criteria
  - Data retention policies
  - Anonymization requirements
- Policy templates for common scenarios

---

## Phase 6: Analytics & Reporting

### 6.1 Hospital Analytics Dashboard
**New Page:** `/hospital-admin/analytics`

Key metrics:
- **Request Analytics:**
  - Total requests received (by month/year)
  - Approval rate
  - Average response time
  - Most requested data types
  - Request trends over time

- **Research Impact:**
  - Number of studies supported
  - Publications resulting from data
  - Patient populations served by research
  - Research areas contributed to

- **Partnership Analytics:**
  - Top collaborating organizations
  - Partnership growth over time
  - Geographic distribution of partners
  - Success rate of partnerships

### 6.2 Export & Reporting
- Generate PDF reports for:
  - Board of directors updates
  - Compliance reporting
  - Research impact summaries
  - Annual data sharing reports
- Scheduled automated reports
- Custom report builder

---

## Phase 7: Communication & Notifications

### 7.1 Notification System
**Integration:** Add to header notification icon
- Real-time notifications for:
  - New data access requests
  - Researcher responses to approvals/rejections
  - Study invitation received
  - Partnership milestones
  - Compliance deadlines
  - System updates

### 7.2 Messaging Center
**New Page:** `/hospital-admin/messages`
- Direct messaging with researcher organizations
- Message threads tied to specific requests or studies
- File sharing capabilities
- Message templates for common responses

---

## Phase 8: Team & Access Management

### 8.1 Hospital User Management
**New Page:** `/hospital-admin/team`
- Add multiple users from same hospital:
  - Research coordinators
  - Data privacy officers
  - Department heads
  - Legal/compliance staff
- Role-based permissions:
  - Admin: Full access
  - Reviewer: Can review and approve/reject requests
  - Viewer: Read-only access to requests and partnerships
  - Data Officer: Manage policies and compliance

### 8.2 Department-Level Management
- Assign requests to specific departments
- Department-specific approval workflows
- Track which departments are most active in research

---

## Implementation Priority

### MVP (Minimum Viable Product) - FOR HACKATHON DEMO:
1. ✅ View incoming data access requests (UI exists)
2. **Approve/Reject requests functionality** ← START HERE
3. Request detail modal/dialog
4. Basic hospital profile editing

### Phase 2 - Post-Hackathon:
1. Hospital directory listing
2. Study marketplace browsing
3. Active partnerships page
4. Notification system

### Phase 3 - Full Production:
1. Analytics and reporting
2. Audit trail and compliance
3. Team management
4. Advanced messaging

---

## Technical Architecture Notes

### Database Schema Needed:
- ✅ `hospitals` - exists
- ✅ `hospital_data_access_requests` - exists
- ❓ `hospital_profiles` - may need to extend hospitals table
- ❓ `data_sharing_agreements` - referenced but doesn't exist
- ❓ `study_opportunities` - for marketplace
- ❓ `hospital_study_participation` - tracking
- ❓ `audit_logs` - compliance tracking
- ❓ `hospital_users` - multi-user support

### API Endpoints Needed:
```
POST   /api/hospital/data-requests/:id/approve
POST   /api/hospital/data-requests/:id/reject
GET    /api/hospital/data-requests
GET    /api/hospital/profile
PUT    /api/hospital/profile
GET    /api/hospital/partnerships
GET    /api/hospital/available-studies
POST   /api/hospital/studies/:id/express-interest
GET    /api/hospital/audit-log
GET    /api/hospital/analytics
```

### Frontend Pages to Create:
- ✅ `/hospital-admin/dashboard` - exists
- `/hospital-admin/profile` - new
- `/hospital-admin/partnerships` - new
- `/hospital-admin/study-marketplace` - new
- `/hospital-admin/compliance` - new
- `/hospital-admin/analytics` - new
- `/hospital-admin/team` - new

---

## Next Immediate Steps:

1. **Implement Request Approval/Rejection**
   - Add modal/dialog for request details
   - Create backend API endpoints
   - Update request status in database
   - Send notifications to researchers

2. **Create Hospital Profile Page**
   - Form to edit hospital information
   - Visibility toggle for directory
   - Save to database

3. **Build Request Detail View**
   - Show all ZK proof details
   - Display researcher information
   - Show data requirements clearly
   - Add approve/reject buttons

4. **Test End-to-End Flow**
   - Researcher submits request
   - Hospital receives and reviews
   - Hospital approves
   - Researcher gets notification
   - Data sharing agreement created
