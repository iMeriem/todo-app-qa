# Todo App QA Tests

This repository contains QA testing resources for [delbetu/todo-app](https://github.com/delbetu/todo-app), a full-stack Todo application with both frontend and backend components.

## Project Selection

The Todo App was selected for this QA assessment because:

1. It has both frontend (Backbone.js) and backend (Rails API) components
2. It includes user interaction features (authentication, task management)
3. It has a reasonable setup process for local testing
4. It provides clear API documentation
5. It includes common web application features (CRUD operations, authentication)
6. The complexity level is appropriate for demonstrating testing skills

## Repository Structure

- `/test-plan.md`: Comprehensive test plan document
- `/test/`: Automated tests for critical user flows
- `/bug-reports/`: Documentation of bugs discovered during testing

## Test Setup

### Prerequisites

- Node.js v12+ and npm v6+
- Ruby v2.5.7+ and Bundler
- Git
- Chrome browser (for UI tests)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/iMeriem/todo-app-qa.git
cd todo-app-qa
```

2. Install dependencies:
```bash
npm install
```

3. Clone and set up the Todo App:
```bash
git clone https://github.com/delbetu/todo-app.git
cd todo-app

# Setup backend
bash Install Ruby dependencies
bundle install

# Set up the database
bundle exec rake db:create
bundle exec rake db:migrate
bundle exec rake db:seed

# Start the Rails server
rails server

# In a new terminal, setup frontend
cd todo-app

# Install frontend dependencies 
npm install

# Build and start the frontend
npm run build
npm run dev

## Running Tests

To run all tests:
```bash
npm test
```

To run specific test suites:
bash
# API tests only
npm run test:api

# UI tests only
npm run test:ui
```

## Test Approach

The automated tests focus on three critical user flows:

1. Authentication Flow**: Testing user login, token retrieval, and authentication validation
2. Task List Management Flow**: Testing CRUD operations for task lists
3. Task Item Management Flow**: Testing CRUD operations for individual tasks

Each flow includes both positive and negative test scenarios to ensure robust validation.

## Assumptions and Modifications

1. Environment Assumptions:
   - The application runs locally on the default ports (Backend: 3000, Frontend: 8080)
   - The default admin user exists with credentials admin@todo.com/admin

2. Test Modifications:
   - Added TypeScript support for better type checking
   - Used Axios for API requests instead of native fetch for better error handling
   - Implemented Selenium WebDriver for UI testing in addition to API testing
   - Some tests may need adjustments based on the actual UI implementation details

