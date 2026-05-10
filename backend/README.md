# Backend

Express API for the Team Task Manager.

## Scripts

- `npm run dev` starts the API with Nodemon
- `npm start` starts the production server
- `npm run prisma:migrate` creates and applies local migrations
- `npm run prisma:deploy` applies migrations in production
- `npm run prisma:seed` creates demo users and a demo project

## Notes

- Admin-only routes are protected with `requireRole("ADMIN")`.
- Member users can read their own projects/tasks and update status on their assigned tasks.
- All protected routes require `Authorization: Bearer <token>`.
