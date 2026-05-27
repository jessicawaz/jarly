import { db } from "@/lib/db/client";
import { budgets, goals, notifications, spends } from "@/lib/db/schema";
import { and, between, eq, inArray, isNull, sum } from "drizzle-orm";
import { DateTime } from "luxon";

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(403).end(); // unauthorized
  }

  if (req.method === "POST") {
    const monthStart = DateTime.now()
      .minus({ months: 1 })
      .startOf("month")
      .toUTC();
    const monthEnd = DateTime.now().minus({ months: 1 }).endOf("month").toUTC();

    // Get users that have enabled
    const notificationsToSend = await db
      .select()
      .from(notifications)
      .where(eq(notifications.monthlyRecap, true));

    const usersEnabled = notificationsToSend.map(({ userId }) => userId);

    const userBudgets = await db
      .select()
      .from(budgets)
      .where(
        and(
          inArray(budgets.userId, usersEnabled),
          eq(budgets.month, monthStart.toFormat("yyyy-MM-dd")),
        ),
      );

    const userSpends = await db
      .select({
        spentCents: sum(spends.amountCents),
        userId: spends.userId,
        jar: spends.jar,
      })
      .from(spends)
      .where(
        and(
          inArray(spends.userId, usersEnabled),
          between(spends.createdAt, monthStart, monthEnd),
        ),
      )
      .groupBy(spends.userId, spends.jar);

    const userGoals = await db
      .select()
      .from(goals)
      .where(
        and(
          inArray(goals.userId, usersEnabled),
          isNull(goals.archivedAt),
          between(goals.completedAt, monthStart, monthEnd),
        ),
      );

    const recapPerUser = notificationsToSend
      .map(({ pushToken, userId }) => {
        const thisUserSpends = userSpends.filter((s) => s.userId === userId);
        const thisUserBudget = userBudgets.find((b) => b.userId === userId);
        const thisUserGoals = userGoals.filter((g) => g.userId === userId);

        if (!thisUserBudget) {
          return;
        }

        const totalSpent = getTotalSpent(thisUserSpends);
        const totalSpentCentsNeeds = totalSpent.needsSpentCents;
        const totalSpentCentsGoals = totalSpent.goalsSpentCents;
        const totalSpentCentsFun = totalSpent.funSpentCents;

        const topJar = getTopJar(totalSpent);

        const leftover = getLeftover(thisUserBudget, totalSpent);
        const leftoverNeedsCents = leftover.needsLeftoverCents;
        const leftoverGoalsCents = leftover.goalsLeftoverCents;
        const leftoverFunCents = leftover.funLeftoverCents;

        const completedGoalCount = thisUserGoals?.length;

        const totalSpentString = `Total spent this month: $${
          (totalSpentCentsNeeds + totalSpentCentsGoals + totalSpentCentsFun) /
          100
        }`;
        const topJarString = topJar
          ? `Your most used jar was ${topJar} jar`
          : null;

        const leftoverString = buildLeftoverString(
          leftoverFunCents,
          leftoverGoalsCents,
          leftoverNeedsCents,
        );

        const goalsCompletedString =
          completedGoalCount > 0
            ? `You also completed ${completedGoalCount} goal${completedGoalCount > 1 ? "s" : ""} this month!`
            : null;

        const recapString = [
          totalSpentString,
          topJarString,
          leftoverString,
          goalsCompletedString,
        ]
          .filter(Boolean)
          .join(" ");

        return {
          to: `ExponentPushToken[${pushToken}]`,
          title: "Jarly Monthly Recap",
          body: recapString,
        };
      })
      .filter(Boolean); // filter out users without budget set for last month

    const expoPostBody = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recapPerUser),
    });

    return res.status(200).json({ sent: recapPerUser.length });
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).end();
}

const getTotalSpent = (spends) => {
  const needsSpends = spends
    .filter(({ jar }) => jar === "needs")
    ?.map(({ spentCents }) => spentCents);
  const goalsSpends = spends
    .filter(({ jar }) => jar === "goals")
    ?.map(({ spentCents }) => spentCents);
  const funSpends = spends
    .filter(({ jar }) => jar === "fun")
    ?.map(({ spentCents }) => spentCents);

  const needsSpentCents = sumSpends(needsSpends);
  const goalsSpentCents = sumSpends(goalsSpends);
  const funSpentCents = sumSpends(funSpends);

  return { needsSpentCents, goalsSpentCents, funSpentCents };
};

const sumSpends = (spends) => {
  return spends.reduce((acc, sp) => {
    return acc + sp;
  }, 0);
};

const getTopJar = ({ needsSpentCents, goalsSpentCents, funSpentCents }) => {
  if (needsSpentCents > goalsSpentCents && needsSpentCents > funSpentCents) {
    return "needs";
  } else if (
    goalsSpentCents > needsSpentCents &&
    goalsSpentCents > funSpentCents
  ) {
    return "goals";
  } else if (
    funSpentCents > needsSpentCents &&
    funSpentCents > goalsSpentCents
  ) {
    return "fun";
  } else {
    return null;
  }
};

const getLeftover = (
  budget,
  { needsSpentCents, goalsSpentCents, funSpentCents },
) => {
  const needsBudgetCents = budget.needsAmt;
  const goalsBudgetCents = budget.goalsAmt;
  const funBudgetCents = budget.funAmt;

  const needsLeftoverCents = needsBudgetCents - needsSpentCents;
  const goalsLeftoverCents = goalsBudgetCents - goalsSpentCents;
  const funLeftoverCents = funBudgetCents - funSpentCents;

  return { needsLeftoverCents, goalsLeftoverCents, funLeftoverCents };
};

const buildLeftoverString = (
  leftoverFunCents,
  leftoverGoalsCents,
  leftoverNeedsCents,
) => {
  const leftoverJars = [];
  if (leftoverFunCents > 0) {
    leftoverJars.push("fun");
  }
  if (leftoverNeedsCents > 0) {
    leftoverJars.push("needs");
  }
  if (leftoverGoalsCents > 0) {
    leftoverJars.push("goals");
  }

  let leftoverString = "";
  if (leftoverJars.length > 0) {
    const jarList =
      leftoverJars.length === 1
        ? `your ${leftoverJars[0]} jar`
        : leftoverJars
            .slice(0, -1)
            .map((j) => `your ${j} jar`)
            .join(", ") +
          ` and your ${leftoverJars[leftoverJars.length - 1]} jar`;

    leftoverString = `You left some jar space this month in ${jarList}.`;
  }

  return leftoverString;
};
