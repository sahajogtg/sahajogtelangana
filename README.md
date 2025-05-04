# Sahaja Yoga Telangana Website

This is a website for Sahaja Yoga Telangana built with Next.js, NextAuth.js for authentication, and MongoDB for database storage.

## Project Structure

- `src/app`: Contains all the Next.js application pages and API routes
- `src/components`: Reusable UI components
- `src/models`: MongoDB schemas for data modeling
- `src/database`: Database connection configuration
- `src/validator`: Form validation schemas

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   MONGO_URL=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication

The site uses NextAuth.js for authentication with:
- Credentials provider (email/password)
- Google OAuth (optional)
- GitHub OAuth (optional)

## Debugging Authentication Issues

If you encounter authentication issues:
1. Check browser console for errors
2. Verify MongoDB connection is working
3. Make sure user passwords are properly hashed in the database
4. Check NextAuth configuration in `src/app/api/auth/[...nextauth]/options.ts`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
