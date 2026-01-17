# AI Accountant

A personal accounting application built with SvelteKit 5 and Supabase. Manage your finances with multi-currency support, categorized transactions, and custom tags.

## Features

- **Multi-Currency Accounts**: Create accounts in different currencies (USD, EUR, GBP, JPY, CNY, INR, CAD, AUD)
- **Account Types**: Support for Asset, Income, and Expense accounts
- **Transaction Management**:
  - Deposits: Add money to accounts
  - Transfers: Move money between accounts
  - Expenses: Record spending from accounts
- **Tagging System**: Organize accounts and transactions with custom colored tags
- **Real-time Balance Updates**: Automatic balance calculations via database triggers
- **Dashboard**: Overview of total assets, income, and expenses
- **Date Tracking**: All transactions include date and description

## Tech Stack

- **Frontend & Backend**: SvelteKit 5 (with JavaScript)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Custom CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([create one for free](https://supabase.com))

### 1. Set Up Supabase

1. Create a new project in Supabase
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase-schema.sql` into the SQL Editor
4. Run the SQL to create all tables, triggers, and policies

### 2. Configure Environment Variables

#### For Local Development

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   You can find these values in your Supabase project settings under "API".

   **Note**: The `.env` file is already in `.gitignore` and will not be committed to your repository.

#### For Production (Vercel)

When deploying to Vercel, you don't need a `.env` file. Instead:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following environment variables:
   - `PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key

Vercel will automatically inject these variables during build and runtime.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
npm run preview
```

## Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your project in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository

3. Configure Environment Variables:
   - In the deployment settings, add the environment variables:
     - `PUBLIC_SUPABASE_URL`
     - `PUBLIC_SUPABASE_ANON_KEY`
   - Get these values from your Supabase project settings

4. Deploy:
   - Vercel will automatically build and deploy your application
   - Future commits to your main branch will trigger automatic deployments

**Note**: The `.env` file is gitignored and won't be deployed. Vercel uses the environment variables you configured in the dashboard.

## Database Schema

The application uses the following main tables:

- **accounts**: Store account information (name, type, currency, balance)
- **transactions**: Record all financial transactions
- **tags**: Custom labels for categorization
- **account_tags**: Junction table linking accounts to tags
- **transaction_tags**: Junction table linking transactions to tags

### Automatic Balance Updates

The database includes PostgreSQL triggers that automatically update account balances when transactions are created or deleted:
- **Deposits**: Increase the balance of the target account
- **Expenses**: Decrease the balance of the source account
- **Transfers**: Decrease source account and increase target account

## Usage Guide

### Creating Accounts

1. Navigate to the "Accounts" page
2. Click "Add Account"
3. Fill in:
   - Account name
   - Type (Asset, Income, or Expense)
   - Currency
   - Optional description
   - Optional tags
4. Click "Create Account"

### Recording Transactions

1. Navigate to the "Transactions" page
2. Click "Add Transaction"
3. Select transaction type:
   - **Deposit**: Add money to an asset account
   - **Transfer**: Move money between asset accounts
   - **Expense**: Record spending from an asset account
4. Fill in amount, date, description, and tags
5. Click "Create Transaction"

The account balances will update automatically.

### Managing Tags

1. Navigate to the "Tags" page
2. Click "Add Tag"
3. Enter a name and choose a color
4. Use tags to categorize accounts and transactions

## API Routes

All API routes are located in `src/routes/api/`:

- **GET /api/accounts** - List all accounts
- **POST /api/accounts** - Create new account
- **GET /api/accounts/[id]** - Get single account
- **PUT /api/accounts/[id]** - Update account
- **DELETE /api/accounts** - Delete account

- **GET /api/transactions** - List all transactions
- **POST /api/transactions** - Create new transaction
- **DELETE /api/transactions** - Delete transaction

- **GET /api/tags** - List all tags
- **POST /api/tags** - Create new tag
- **DELETE /api/tags** - Delete tag

## Project Structure

```
ai-accountant/
├── src/
│   ├── lib/
│   │   └── supabase.js          # Supabase client configuration
│   ├── routes/
│   │   ├── api/                 # Backend API routes
│   │   │   ├── accounts/
│   │   │   ├── transactions/
│   │   │   └── tags/
│   │   ├── accounts/            # Accounts page
│   │   ├── transactions/        # Transactions page
│   │   ├── tags/                # Tags page
│   │   ├── +layout.svelte       # Root layout with navigation
│   │   └── +page.svelte         # Dashboard
│   └── app.css                  # Global styles
├── supabase-schema.sql          # Database schema
└── .env.example                 # Environment variables template
```

## License

MIT

## Support

For issues or questions, please open an issue on the project repository.
