# TutorFlow AI
# Product Requirements Document (PRD)

**Document Version:** 1.0  
**Product:** TutorFlow AI  
**Document Type:** MVP Product Requirements Document  
**Status:** Baseline MVP Scope  
**Initial Language:** English  
**Primary Users:** Independent Teachers and Educators

---

# 1. Product Overview

## 1.1 Product Description

TutorFlow AI is an AI-powered business management application designed for independent teachers, tutors, trainers and small teaching academies.

The application provides two primary capabilities:

1. A Teacher Dashboard for visually managing the teaching business.
2. An integrated AI Voice Agent that allows teachers to manage business activities through natural voice or text conversations.

Teachers can manage their students, branches, batches, attendance, fees and class schedules from one application.

The AI voice agent will eventually allow teachers to perform these operations conversationally instead of navigating through multiple screens.

## 1.2 Product Vision

To make managing a teaching business as simple as having a conversation.

A teacher should be able to manage daily administrative activities without spending unnecessary time navigating complex software.

## 1.3 Problem Statement

Independent teachers frequently depend on:
- Spreadsheets.
- Paper registers.
- Messaging applications.
- Separate attendance records.
- Manual fee tracking.
- Multiple disconnected applications.

These methods make business management time-consuming and difficult to maintain consistently.

TutorFlow AI aims to provide a unified application that simplifies these activities through a visual dashboard and an AI-powered conversational assistant.

---

# 2. Product Goals

The initial MVP should:

1. Provide a centralized platform for teachers to manage their teaching business.
2. Allow teachers to manage one or multiple branches.
3. Simplify student and batch management.
4. Provide attendance management.
5. Track student fees and outstanding payments.
6. Manage class schedules and programmes.
7. Provide a clear branch-specific business overview.
8. Introduce an AI voice agent that can perform authorized business operations.
9. Maintain consistent information between the dashboard and voice agent.
10. Establish a foundation for future student-facing functionality.

## 2.1 Success Criteria

The MVP will be considered successful when a teacher can:

- Register and access an account.
- Set up a teaching business.
- Create and manage a branch.
- Add and manage students.
- Create and manage batches.
- Record and review attendance.
- Maintain fee information and payment records.
- Manage class schedules.
- View branch-specific business information.
- Use the AI agent to perform supported operations.
- Verify that AI-performed changes appear correctly on the dashboard.

---

# 3. Target Users

## 3.1 Primary Users

Independent teachers and educators.

Examples:

- Tuition teachers.
- Dance instructors.
- Music teachers.
- Yoga instructors.
- Fitness trainers.
- Swimming instructors.
- Other independent educators.

## 3.2 Account Model

The MVP will use an individual teacher account model.

- Every teacher registers independently.
- One account belongs to one teacher.
- A teacher manages one teaching business or academy.
- A business can contain one or multiple branches.
- Staff accounts and role-based permissions are excluded from the initial MVP.

## 3.3 Future Users

Students may receive access to a separate student dashboard in a future release.

Student-facing authentication and dashboard functionality are not part of the MVP.

---

# 4. Business Structure

The application will follow this hierarchy:

**Teacher Account → Business/Academy → Branches → Batches → Students**

## 4.1 Business Management

Each teacher account manages one business or academy.

During registration, the teacher provides the business name and teaching category.

## 4.2 Branch Management

A teacher can:

- Create one branch.
- Create multiple branches.
- Add additional branches after registration.
- Update branch details.
- View branch-specific information.

Branch details may include:

- Branch name.
- Address and location.
- Contact information.
- Other relevant details.

## 4.3 Branch Data Isolation

Students, batches, attendance, fee records and schedules must be associated with the appropriate branch.

The application must not accidentally display or modify records belonging to another teacher.

## 4.4 Branch Selection

- A teacher with one branch can have that branch selected automatically.
- A teacher with multiple branches must be able to select a branch.
- Branch-specific pages must use the selected branch context.
- When an AI operation requires a branch and multiple branches are available, the AI must ask which branch the teacher means if it cannot determine the correct one.

**Important:** The initial MVP will not provide consolidated totals or combined business reporting across all branches.

---

# 5. Registration and Onboarding

## 5.1 Registration Fields

The following information is mandatory:

- Full name.
- Email address.
- Password.
- Business or academy name.
- Teaching category.

## 5.2 Teaching Categories

Initial categories:

- Dance.
- Tuition.
- Music.
- Yoga.
- Fitness.
- Swimming.
- Other.

The category list should be extensible.

## 5.3 Progressive Onboarding

Teachers should not be required to provide every business detail during registration.

The following information can be added later:

- Branch information.
- Branch location.
- Contact information.
- Students.
- Batches.
- Class schedules.
- Additional business details.

The teacher should be able to access the application after completing the basic registration process.

When an operation requires missing information, the application should request it at that time.

## 5.4 Authentication

Teachers must authenticate before accessing private business information.

Email verification, password recovery and alternative authentication methods will be finalized during technical design.

---

# 6. Application Structure

The application will have two primary components.

## 6.1 Teacher Dashboard

The dashboard provides visual access to business information and management operations.

## 6.2 Teacher Voice Agent

The voice agent provides conversational access to business information and authorized management operations.

## 6.3 Navigation Experience

- The teacher dashboard and voice agent belong to the same application.
- Both must be accessible through application navigation.
- The chatbot is the intended default landing experience after login.
- Teachers can switch between the chatbot and dashboard.
- Both components use the same backend and database.

The teacher dashboard will be developed first, followed by the voice agent.

---

# 7. Teacher Dashboard Requirements

## 7.1 Dashboard Navigation

The initial dashboard will contain the following sections:

1. Overview.
2. Branches.
3. Students.
4. Batches.
5. Attendance.
6. Fees.
7. Schedule.
8. Reports.
9. Settings.

## 7.2 Overview

The Overview page must display information for the selected branch only.

It should contain:

1. Total students.
2. Active batches.
3. Today's classes.
4. Today's attendance.
5. Pending fees.
6. Upcoming classes.

### Overview Rules

- Information must belong to the selected branch.
- No consolidated information across branches is required.
- A single-branch teacher can have their branch selected automatically.
- The information should reflect current backend records.
- Selecting another branch should display that branch's information.

## 7.3 Branch Management

Teachers should be able to:

- Add branches.
- View branches.
- Update branch information.
- Manage branch details.
- Select a branch for other management activities.

## 7.4 Student Management

Teachers should be able to:

- Add students.
- View student details.
- Search students.
- Update student information.
- Assign students to batches.
- View students by branch.

### Mandatory Student Fields

- Student name.
- Contact number.
- Branch.

### Optional Student Fields

- Parent or guardian name.
- Age or date of birth.
- Batch.
- Joining date.

### Branch Assignment Rules

- If only one branch exists, it can be assigned automatically.
- If multiple branches exist, the teacher must select the appropriate branch.

Student records should be editable after creation.

Additional rules for duplicate records, inactive students and transfers will be finalized during implementation planning.

## 7.5 Batch Management

Teachers should be able to create and manage batches.

The following details are proposed for batch creation:

- Batch name.
- Branch.
- Subject or programme.
- Days and class timings.
- Maximum student capacity, if applicable.

Teachers should be able to:

- Create batches.
- View batches.
- Update batch details.
- Assign students.
- View students belonging to a batch.

The exact batch fields and scheduling rules will be refined during detailed design.

## 7.6 Attendance Management

Teachers should be able to:

- View batches and their students.
- Record attendance.
- Mark students present or absent.
- Review attendance records.
- View attendance by date.
- View attendance by batch.
- Correct attendance records when authorized.

Attendance should be associated with the correct student, batch, branch and class date.

Detailed attendance rules, late arrivals and correction history will be defined during implementation planning.

## 7.7 Fee Management

Teachers should be able to:

- Maintain student fee information.
- Define applicable fees.
- Record payments.
- View outstanding fees.
- Identify overdue payments.
- Review payment history.
- View fee information branch-wise.

The MVP will initially focus on fee tracking and payment record management.

Online payment gateway integration is not confirmed as part of the initial MVP.

## 7.8 Schedule Management

Teachers should be able to:

- Create class schedules.
- Associate schedules with batches.
- Specify class days and timings.
- View upcoming classes.
- Update schedules.
- Manage programmes offered by their business.

Scheduling conflicts and recurring schedule rules will be finalized during detailed design.

## 7.9 Reports

The Reports section should provide branch-specific information.

Potential reports include:

- Student information.
- Attendance summaries.
- Fee collection summaries.
- Pending fee summaries.
- Batch information.

Advanced analytics and cross-branch consolidated reports are outside the initial MVP scope.

## 7.10 Settings

The Settings section should allow teachers to manage:

- Personal profile.
- Business profile.
- Teaching category.
- Application preferences.
- Voice preferences when voice functionality is available.
- Account security settings.

---

# 8. AI Voice Agent Requirements

## 8.1 Purpose

The voice agent is the conversational interface through which teachers can access and manage their business.

It should reduce the need to manually navigate dashboard pages for supported operations.

## 8.2 Interaction Methods

The voice agent must support:

- Voice input.
- Text input.

Voice is the primary interaction method.

## 8.3 AI Response Behavior

- Display responses as text.
- Play responses as voice by default.
- Allow teachers to mute voice output.
- Allow teachers to stop audio playback.
- Keep text interaction available independently.

## 8.4 Voice Interaction Workflow

1. Teacher activates voice input.
2. Application captures audio.
3. Speech is converted into text.
4. Recognized text appears in the conversation.
5. AI identifies the intended operation.
6. AI extracts the required information.
7. AI asks follow-up questions if necessary.
8. AI invokes the appropriate authorized backend operation.
9. Backend validates and executes the operation.
10. AI displays the confirmed result.
11. AI speaks the response.

## 8.5 Initial AI Capabilities

The following capabilities are planned:

### Student Management

- Add a student.
- Find a student.
- View student information.
- Update student information.
- Assign a student to a batch.

### Batch Management

- Create a batch.
- Find a batch.
- View batch details.
- Assign students to batches.

### Attendance

- Mark attendance.
- View attendance.
- Retrieve attendance information.

### Fees

- Check outstanding fees.
- View payment records.
- Record a payment.

### Schedule

- View upcoming classes.
- Create or update supported class schedules.

These capabilities will be enabled progressively as the corresponding backend modules are completed and tested.

## 8.6 Follow-up Questions

When required information is missing, the AI should ask the teacher for it.

Example:

Teacher: "Add a new student named Rahul."

AI: "Which branch should Rahul be assigned to?"

Teacher: "Bangalore Branch."

AI: "What is Rahul's contact number?"

The assistant should collect the required information before attempting the operation.

## 8.7 Operation Confirmation

- The AI must not claim success before backend confirmation.
- Operations must be validated by backend services.
- Important or potentially destructive operations may require explicit confirmation.
- Retried requests must not accidentally create duplicate records.

## 8.8 AI Access Restrictions

The AI must:

- Use authenticated teacher context.
- Access only the teacher's authorized business records.
- Use defined backend APIs or services.
- Respect branch context.
- Never execute arbitrary database queries.
- Never bypass backend validation or authorization.

---

# 9. Language Requirements

## 9.1 Initial Release

The MVP will support English only.

- Application interface: English.
- Voice input: English.
- AI responses: English text and voice.
- Mixed-language support: deferred.

## 9.2 Future Expansion

The architecture should allow additional languages to be introduced in future versions.

Multilingual support is not an MVP requirement.

---

# 10. Student Dashboard – Future Scope

A separate student dashboard is planned after the teacher-facing application is completed.

Students may eventually be able to:

1. View attendance for the previous two months.
2. View outstanding fees, if any.
3. View programmes available for them to attend.

The following are outside the MVP:

- Student registration and login.
- Student-facing dashboard.
- Student self-service attendance view.
- Student-facing fee view.
- Student programme discovery interface.

The initial backend should maintain appropriately structured student, attendance, fee and programme records so that these features can be added later.

---

# 11. Non-Functional Requirements

## 11.1 Security

- Authentication is required for private application access.
- Each teacher's records must be isolated.
- Backend authorization must enforce data ownership.
- AI operations must use authenticated user context.
- Sensitive operations must be validated.
- Passwords must be stored securely using appropriate password hashing.

## 11.2 Data Integrity

- Business records must be stored consistently.
- Student records must belong to the correct teacher and branch.
- Attendance must reference the correct student, batch and class date.
- Payment records must be associated with the correct student.
- Backend operations must prevent accidental duplicate records where appropriate.

## 11.3 Performance

- Dashboard pages should load within a reasonable time under normal operating conditions.
- Common operations should provide clear feedback.
- AI response times should be monitored and optimized.
- Long-running voice processing should provide a visible processing state.

Exact performance targets will be defined during technical design and testing.

## 11.4 Reliability

- Handle network interruptions gracefully.
- Display meaningful errors.
- Avoid losing data during failed operations.
- Provide appropriate retry behavior.
- Do not show false success messages.

## 11.5 Usability

- Keep dashboard navigation simple.
- Use clear labels and understandable actions.
- Make common teacher operations easy to find.
- Keep voice interaction conversational.
- Provide visible feedback during audio recording and processing.

## 11.6 Scalability and Extensibility

The architecture should support:

- Multiple independent teacher accounts.
- Multiple branches per teacher.
- Increasing numbers of student and attendance records.
- Future language expansion.
- Future student dashboard development.
- Future staff and role management.

---

# 12. Proposed Technology Stack

The following technologies are proposed for the MVP.

| Layer | Technology |
|---|---|
| Frontend | React with JavaScript |
| Styling | Tailwind CSS |
| Backend | Java 21 |
| Backend framework | Spring Boot |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| Authentication | Spring Security and JWT |
| AI | LLM with structured tool/function calling |
| Speech-to-text | Provider to be selected |
| Text-to-speech | Provider to be selected |
| API style | REST APIs |
| Version control | Git and GitHub |

Technology choices will be finalized during architecture design.

The system should be developed with clear separation between frontend, backend, database and AI integration.

---

# 13. High-Level System Architecture

The proposed application will follow this architecture:

**Teacher**
↓
**React Application**
↓
**Spring Boot Backend**
↓
**PostgreSQL Database**

The AI voice agent will communicate with the backend through controlled APIs and services.

### Dashboard Flow

Teacher → Dashboard → REST API → Backend Validation → Database → Dashboard Response

### Voice Agent Flow

Teacher Voice → Speech-to-Text → AI Agent → Intent and Parameter Extraction → Backend API/Service → Database → AI Response → Text-to-Speech

The AI agent must not connect directly to the database.

The backend remains the source of truth for all business data.

---

# 14. MVP Development Phases

## Phase 1 – Product Planning and Design

- Finalize MVP requirements.
- Create user flows.
- Design dashboard wireframes.
- Finalize database design.
- Finalize system architecture.

## Phase 2 – Teacher Dashboard

- Registration and authentication.
- Business profile.
- Branch management.
- Student management.
- Batch management.
- Attendance management.
- Fee management.
- Schedule management.
- Reports and Overview.
- Settings.

## Phase 3 – Backend Validation and Testing

- Validate APIs.
- Test business rules.
- Verify branch-level access.
- Verify teacher data isolation.
- Test database relationships.

## Phase 4 – AI Voice Agent

- Integrate an AI model.
- Implement text conversation.
- Implement speech-to-text.
- Implement text-to-speech.
- Implement structured tool/function calling.
- Connect supported business operations.
- Implement follow-up questions and confirmations.

## Phase 5 – Complete MVP Testing

- End-to-end testing.
- Security testing.
- Voice interaction testing.
- Data consistency testing.
- Usability testing with teachers.
- Bug fixing.

## Phase 6 – Deployment

- Deploy frontend.
- Deploy backend.
- Configure production database.
- Configure AI and speech services.
- Configure HTTPS and security.
- Set up logging and monitoring.
- Release the MVP to initial users.

---

# 15. MVP Acceptance Criteria

The MVP is ready for initial release when the following conditions are met.

### Account and Business

- A teacher can register and log in.
- A teacher can manage their business profile.
- A teacher can create and manage one or multiple branches.
- Teachers cannot access another teacher's business data.

### Dashboard

- The dashboard contains the agreed navigation sections.
- Branch selection works correctly.
- Overview information is branch-specific.
- The six agreed Overview statistics are displayed using actual records.

### Student and Batch Management

- A teacher can add and update students.
- Mandatory student fields are validated.
- Students are assigned to the correct branch.
- A teacher can create and manage batches.
- Students can be assigned to batches.

### Attendance and Fees

- A teacher can record and review attendance.
- Attendance is associated with the correct branch, batch and student.
- A teacher can maintain fee information.
- Payments can be recorded.
- Outstanding fees can be identified.

### Scheduling and Reports

- A teacher can create and manage class schedules.
- Upcoming classes can be viewed.
- Branch-specific reports can be accessed.

### Voice Agent

- A teacher can interact using text.
- A teacher can interact using voice.
- The agent can understand supported English requests.
- The agent can ask follow-up questions.
- The agent can perform supported backend operations.
- Successful operations are confirmed only after backend execution.
- AI-performed changes appear in the dashboard.

### Future Scope Exclusion

Student-facing login and dashboard functionality are not required for MVP acceptance.

---

# 16. Risks and Assumptions

## 16.1 Risks

- Speech recognition may struggle with noise or unclear speech.
- AI may misunderstand a teacher's request.
- Incorrect branch identification could affect business data.
- Duplicate requests may create duplicate records without proper safeguards.
- AI and speech service costs may increase with usage.
- Teachers may need guidance during initial onboarding.

## 16.2 Mitigations

- Validate all AI operations through backend services.
- Ask clarification questions when required.
- Enforce teacher and branch authorization.
- Implement duplicate-operation protection.
- Monitor AI and speech service usage.
- Test with real teachers before wider release.

## 16.3 Assumptions

- The initial application targets individual teachers and small teaching businesses.
- Each teacher account manages one business or academy.
- One business can have multiple branches.
- The initial language is English.
- The initial MVP is teacher-facing.
- The dashboard will be developed before the voice agent.
- Student-facing functionality will be added later.

---

# 17. Out of Scope for MVP

The following features are explicitly excluded from the initial MVP:

- Student dashboard.
- Student login and self-service access.
- Staff accounts and role-based access.
- Multilingual and mixed-language support.
- Consolidated reporting across branches.
- Online payment gateway integration unless later prioritized.
- Advanced marketing and promotional automation.
- Complex accounting and tax management.
- Third-party messaging integrations unless later prioritized.

---

# 18. Future Product Roadmap

Potential future enhancements include:

1. Student dashboard.
2. Student attendance history for the previous two months.
3. Student outstanding fee visibility.
4. Student programme discovery.
5. Additional language support.
6. Staff accounts and permissions.
7. Online payment integration.
8. Automated fee reminders.
9. WhatsApp or other messaging integrations.
10. Advanced business analytics.

These features are not commitments for the MVP.

---

# 19. Version History

| Version | Description |
|---|---|
| 0.1 | Initial product requirements |
| 0.2 | Account, branch, onboarding and interaction decisions |
| 0.3 | English-only direction and student management |
| 0.4 | Teacher-first development scope and future student dashboard |
| 0.5 | Dashboard navigation and branch-specific Overview |
| 1.0 | Consolidated baseline MVP PRD |

---

# 20. Final MVP Definition

**TutorFlow AI MVP is a teacher-focused business management application consisting of a Teacher Dashboard and an integrated English-language AI Voice Agent.**

The Teacher Dashboard will be developed first to establish the business management functionality and backend services.

The AI Voice Agent will then be integrated to allow teachers to access and perform supported operations through natural voice and text conversations.

Both components will use the same backend and database.

The initial MVP will focus on individual teachers managing one or multiple branches. It will support student, batch, attendance, fee and schedule management, with branch-specific business information.

A student-facing dashboard and multilingual support will be considered in future releases.

**The primary objective of the MVP is to demonstrate that a teacher can manage their teaching business through a single application, using either the dashboard or the AI voice agent.**
