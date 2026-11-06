# SRMIST — The Connected University Experience

\<p align="center">
&#x20; \<strong>A smarter, more accessible and interactive digital experience for SRM Institute of Science and Technology.\</strong>
\</p>

\<p align="center">
&#x20; \<img src="[https://img.shields.io/badge/Project-University%20Web%20Platform-163B70?style=for-the-badge](https://img.shields.io/badge/Project-University%20Web%20Platform-163B70?style=for-the-badge)" />
&#x20; \<img src="[https://img.shields.io/badge/Status-Under%20Development-orange?style=for-the-badge](https://img.shields.io/badge/Status-Under%20Development-orange?style=for-the-badge)" />
&#x20; \<img src="[https://img.shields.io/badge/Focus-UX%20%7C%20AI%20%7C%20Accessibility-2E8064?style=for-the-badge](https://img.shields.io/badge/Focus-UX%20%7C%20AI%20%7C%20Accessibility-2E8064?style=for-the-badge)" />
\</p>

---

## Overview

The SRMIST website project aims to transform the traditional university website into a connected, interactive and intelligent digital ecosystem.

Rather than functioning solely as an institutional information portal, the platform brings together academic discovery, student services, campus exploration, research visibility and university updates through a unified user experience.

The project focuses on addressing common challenges faced by prospective students, enrolled students, parents, faculty and visitors — including fragmented information, difficult navigation, disconnected university platforms and limited access to relevant resources.

**Our vision:** One university. One connected digital experience.

## Key Features

### 1. Intelligent University Experience

- **AI-powered assistance:** Conversational assistance to help users discover university information and navigate relevant resources.

### 2. Interactive Campus Exploration

- **Cinematic campus introduction:** A visual introduction to SRMIST through campus photography and video.
- **3D Campus Explorer:** Dedicated interactive campus exploration experience.
- **Facility discovery:** Explore campus buildings, academic spaces and university facilities through an interactive interface.

### 3. SRMIST Campus Pulse

A centralised university information hub bringing together:

- University announcements.
- Upcoming events.
- Student achievements.
- Research highlights.
- Campus activities.
- Important institutional updates.

**Homepage News Ticker:** A continuously scrolling announcement ticker connects the homepage to Campus Pulse, allowing visitors to discover important university updates.

### 4. SRMIST Digital Gateway

A centralised directory of official SRMIST digital platforms.

Designed particularly to help newly admitted students identify and access the correct university websites.

Initial platform categories include:

- Student and Academic Services.
- IT and Technical Services.
- Academic and Online Education.
- Digital Library and Learning Resources.

Features include searchable platform listings, category filters, direct external navigation and a dedicated guide for new students.

### 5. Academic and Student Resources

- Academic programme discovery.
- University information and resources.
- Fee calculator.
- Admissions information.
- Student-facing digital services.

---

## Project Modules

| Module          | Description                                      |
| --------------- | ------------------------------------------------ |
| Homepage        | University introduction and central navigation   |
|                 |                                                  |
|                 |                                                  |
| Campus Explorer | Interactive 3D campus experience                 |
| Campus Pulse    | University announcements and updates             |
| Digital Gateway | Centralised directory of SRMIST platforms        |
| AI Assistant    | Conversational university information assistance |
| Fee Calculator  | Programme-related fee estimation                 |

*The implementation and maturity of individual modules may vary during development.*

---

## Technology Stack

The project uses a modern web development architecture.

| Layer           | Technologies                          |
| --------------- | ------------------------------------- |
| Frontend        | React.js, TypeScript                  |
| Build Tool      | Vite                                  |
| Styling         | CSS / existing project styling system |
| Backend         | Python / existing backend services    |
| AI Integration  | LLM-based conversational capabilities |
| Version Control | Git and GitHub                        |
| Deployment      | Vercel (frontend deployment)          |

Additional libraries and integrations are documented in the respective dependency files.

---

## Project Structure

The repository is organised around modular frontend components and supporting backend services.

```text
srm-website/
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── App.tsx
│   │
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── routes/
│   ├── services/
│   └── requirements.txt
│
└── README.md
```

*Illustrative structure: refer to the actual repository for the current directory and file organisation.*

---

## Getting Started

### Prerequisites

Ensure the following are installed:

- Node.js (LTS recommended).
- npm.
- Git.
- Python, if running the backend.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd srm-website
```

### 2. Frontend Setup

Navigate to the frontend directory (or the directory containing the frontend `package.json`).

```bash
npm install
```

### 3. Environment Configuration

Create the required environment file using the existing example configuration, if available.

For example:

```env
VITE_API_URL=http://localhost:8000
```

Configure API keys and other backend secrets only in the backend environment.

**Never commit API keys, passwords, tokens or private credentials to GitHub.**

### 4. Start the Frontend

```bash
npm run dev
```

Vite will provide a local development URL, typically:

```text
http://localhost:5173
```

### 5. Backend Setup

If the backend is required, navigate to its directory.

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend using its configured application entry point.

Refer to the backend configuration for the exact startup command and required environment variables.

---

## Deployment

### Frontend — Vercel

The frontend can be deployed through Vercel using the connected GitHub repository.

General deployment process:

1. Import the GitHub repository into Vercel.
2. Configure the correct frontend root directory.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist` for a standard Vite build.
5. Configure required environment variables.
6. Deploy the application.

Ensure that frontend API endpoints point to the deployed backend rather than localhost.

If the backend is deployed separately, configure the appropriate production API URL and CORS settings.

---

## Design Philosophy

The project follows five primary design principles:

**1. Accessibility**

Information and services should be easy to find and use across devices.

**2. User-Centred Navigation**

Users should be able to reach relevant university resources without navigating through unnecessarily complicated menus.

**3. Visual Consistency**

The platform should maintain a cohesive SRMIST identity through consistent typography, colours, imagery and interaction patterns.

**4. Meaningful Interactivity**

Interactive elements should solve actual user problems rather than exist solely for visual appeal.

**5. Scalability**

New university services, digital platforms and features should be easy to integrate without disrupting existing functionality.

---

## Development Roadmap

| Area                | Planned direction                            |
| ------------------- | -------------------------------------------- |
| Programme Discovery | Improve programme recommendations            |
| Admissions          | Expand personalised navigation               |
| Campus Explorer     | Enhance facility-level exploration           |
| Campus Pulse        | Integrate verified university content feeds  |
| Digital Gateway     | Expand the official platform directory       |
| AI Assistant        | Improve conversational university assistance |
| Mobile Experience   | Optimise all pages for mobile devices        |
| Accessibility       | Improve inclusive navigation and usability   |

---

## Contributing

Contributions and improvements should follow the existing project architecture.

1. Create a feature branch.
2. Implement changes within the relevant module.
3. Test existing functionality.
4. Verify responsiveness.
5. Commit changes with descriptive messages.
6. Submit a pull request for review.

Avoid modifying unrelated components or introducing unnecessary dependencies.

---

## Security and Configuration

- Keep API credentials in environment variables.
- Never expose private backend credentials in frontend code.
- Validate external links and user inputs.
- Configure appropriate CORS policies.
- Avoid committing `.env` files.
- Keep dependencies and integrations properly maintained.

---

## Project Vision

A university website should be more than a collection of pages.

It should serve as the digital connection between the institution and everyone who interacts with it.

Through intelligent discovery, connected services, accessible information and interactive campus experiences, this project aims to create a more intuitive and meaningful digital experience for the SRMIST community.

**SRMIST — One University. One Connected Experience.**
