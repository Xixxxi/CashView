# CashView


# Budget Planning Expo App

![Budget Planning App Logo](assets/icon.png)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)

## Overview

The **CashView App** is a comprehensive financial management tool designed for iPhones, built using React Native. This app empowers users to efficiently track their income and expenses, manage categories, set recurring transactions, and secure their financial data with password protection. With an intuitive interface and robust features, it serves as an essential companion for personal budget planning and financial health monitoring.

## Features

- **User Authentication**
  - Secure access with password protection.
  - Emergency unlock option to remove password protection.

- **Transaction Management**
  - Add, view, edit, and delete income and expense transactions.
  - Detailed transaction information including category, amount, date, account, repeating interval, and notes.
  - Support for recurring transactions with automatic generation of future transactions.

- **Category Management**
  - Predefined categories with customizable icons.
  - Create, edit, and delete custom categories.
  - Search functionality to easily find categories.

- **Currency Support**
  - Select and set a default currency from a comprehensive list.
  - Automatic currency conversion based on predefined exchange rates.

- **Financial Summary**
  - Overview of balance, total income, and total expenses.
  - Visual progress bar representing the ratio of income to expenses.
  - Insights into financial health, indicating if expenses exceed income.

- **Settings**
  - Manage account settings including password management.
  - Select default currency.
  - Delete all user data with confirmation prompts to prevent accidental loss.

- **Responsive Design**
  - Optimized for various iPhone screen sizes.
  - Smooth and intuitive user experience with modals and interactive elements.

## Screenshots

![Home Page](assets/screenshots/home_page.png)
*Home Page displaying financial summary and transactions.*

![Add Transaction](assets/screenshots/add_transaction.png)
*Add Transaction screen with input fields for detailed information.*

![Settings](assets/screenshots/settings.png)
*Settings screen for managing account and app preferences.*

![Password Screen](assets/screenshots/password_screen.png)
*Password authentication screen securing access to the app.*

## Technologies Used

- **React Native**: Framework for building native apps using React.
- **TypeScript**: Superset of JavaScript for type-safe code.
- **Expo**: Toolchain for developing and deploying React Native applications.
- **React Navigation**: Routing and navigation for React Native apps.
- **Context API**: State management across the application.
- **AsyncStorage**: Persistent storage for data like transactions, categories, and user settings.
- **Moment.js**: Date manipulation and formatting.
- **Ionicons**: Icon library for UI components.

## Installation

Follow the steps below to set up and run the Budget Planning Expo App on your local machine.

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. You can download it from [here](https://nodejs.org/).
- **Expo CLI**: Install Expo CLI globally using npm:

  ```bash
  npm install -g expo-cli

- **Git**: Ensure Git is installed to clone the repository.


### Steps

1. **Clone the Repository**

    ```bash
    git clone https://github.com/your-username/budget-planning-expo-app.git
    cd budget-planning-expo-app
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

    or if you prefer using Yarn:

    ```bash
    yarn install
    ```

3. **Start the Expo Server**

    ```bash
    expo start
    ```

4. **Run the App**

    - **On iPhone Simulator**: Press `i` in the terminal to open the app in the iPhone simulator.
    - **On Physical Device**:
      - Install the Expo Go app from the [App Store](https://apps.apple.com/app/expo-go/id982107779).
      - Scan the QR code displayed in the terminal or browser to launch the app on your device.


## Usage

### Initial Setup

1. **Password Setup**: Upon first launch, you'll have the option to set a password to secure your financial data. If you choose to set a password, it will be required every time you open the app.

2. **Setting Default Currency**: Navigate to the **Settings** screen to select your preferred default currency. This currency will be used throughout the app for all transactions.

### Managing Transactions

- **Add a Transaction**:
  - Tap the **+** Floating Action Button on the Home Page.
  - Fill in the details such as amount, category, date, account, repeating interval, and notes.
  - Save the transaction to add it to your list.

- **View Transactions**:
  - On the Home Page, transactions are categorized into **Income** and **Expenses**.
  - Tap on a transaction to view its details and edit notes if necessary.

- **Delete Transactions**:
  - Tap the trash icon next to a transaction to delete it.

### Managing Categories

- **Select Category**:
  - When adding or editing a transaction, tap on the **Category** field to open the **Category Modal**.
  - Choose an existing category or create a new one.

- **Create/Edit/Delete Categories**:
  - In the **Category Modal**, tap on **+ New** to create a new category.
  - Long-press on an existing category to edit or delete it.

### Settings

- **Change Password**:
  - Navigate to **Settings** and select **Change Password**.
  - Enter your current password, followed by the new password.

- **Delete User Data**:
  - In **Settings**, select **Delete User Data** to remove all transactions and reset the app.
