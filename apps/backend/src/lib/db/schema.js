import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  date,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { boolean } from "drizzle-orm/gel-core";

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // null if google oauth only
  displayName: text("display_name").notNull(),
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const budgets = pgTable(
  "budgets",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    month: date("month").notNull(),
    incomeCents: integer("income_cents").notNull(),
    needsPct: integer("needs_pct").notNull(),
    goalsPct: integer("goals_pct").notNull(),
    funPct: integer("fun_pct").notNull(),
    needsAmt: integer("needs_amt").notNull(),
    goalsAmt: integer("goals_amt").notNull(),
    funAmt: integer("fun_amt").notNull(),
  },
  (t) => ({
    uniqUserMonth: unique().on(t.userId, t.month),
  }),
);

export const goals = pgTable("goals", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category"), // add enum
  targetCents: integer("target_cents").notNull(),
  savedCents: integer("saved_cents").notNull().default(0),
  targetDate: text("target_date").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const spends = pgTable("spends", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  budgetId: uuid("budget_id")
    .notNull()
    .references(() => budgets.id, { onDelete: "cascade" }),
  goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
  jar: text("jar").notNull(),
  amountCents: integer("amount_cents").notNull(),
  label: text("label"),
  spentAt: timestamp("spent_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  pushToken: text("push_token").notNull(),
  monthlyRecap: boolean("monthly_recap").default(true).notNull(),
  jarWarnings: boolean("jar_warnings").default(true).notNull(),
  goalMilestones: boolean("goal_milestones").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
