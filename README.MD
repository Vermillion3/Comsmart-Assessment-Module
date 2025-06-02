# ComSmart Project

## Overview
ComSmart is a mobile application built using React Native and Expo. The application provides functionalities for user registration, login, and a dashboard for accessing various features related to learning materials, assessments, and user account management.

## Project Structure
```
ComSmart Upgrade Module 
├── App.js
├── app.json
├── assets
│   └── cosmart_logo_white
├── index.js
├── package.json
├── screens
│   ├── LoginScreen.js
│   ├── RegistrationScreen.js
│   └── dashboard
│       └── DashboardScreen.js
|       └── UserAccountScreen.js
|       └── assessment-module
|           └── compatibility
|               └── CompatibilityScreen.js
|               └── CreateCompatibilityScreen.js
|           └── final-assessment
|               └── FinalAssessmentAssemblyScreen.js
|               └── FinalAssessmentScreen.js
|           └── part-picker
|               └── PartPickerScreen.js
|           └── quiz
|               └── CreateQuizForm.js
|               └── QuizScreen.js
|           └── AssessmentResultsScreen.js
|           └── AssessmentScreen.js
|           └── HardwarePickerModal.js
├── services
│   ├── apiRecords.js
│   └── supabase.js
├── .env
├── .gitignore
└── README.md
```

## Features
- **User Authentication**: Users can register and log in to their accounts.
- **Dashboard**: After logging in, users are directed to a dashboard that includes:
  - Learning Materials
  - Assessment
  - PC Recommendation
  - User Account
  - Help
  - Notification
- **Responsive Layout**: The dashboard layout is designed to be responsive and user-friendly.
- **User Profile**: Displays a placeholder for the user image and user type at the bottom of the dashboard.

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd ComSmart
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up environment variables in the `.env` file.

## Running the Application
To start the application, use the following command:
```
npm start
```
This will launch the Expo development server, and you can run the app on an Android or iOS simulator, or on a physical device using the Expo Go app.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License.