const cron = require("node-cron");
const Task = require("./models/Task");
const { sendTaskReminderEmail } = require("./utils/emailService");

const SCHEDULER_TIMEZONE = process.env.REMINDER_TIMEZONE || "Asia/Kolkata";
const parsedGraceMinutes = Number(process.env.REMINDER_GRACE_MINUTES || "2");
const REMINDER_GRACE_MINUTES = Number.isFinite(parsedGraceMinutes)
  ? Math.max(0, Math.min(10, parsedGraceMinutes))
  : 2;

function getDateTimePartsInTimezone(date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHEDULER_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  return {
    dateStamp: `${parts.year}-${parts.month}-${parts.day}`,
    hhmm: `${parts.hour}:${parts.minute}`,
  };
}

function getCandidateTimes(now) {
  const candidates = new Set();

  for (let offset = 0; offset <= REMINDER_GRACE_MINUTES; offset += 1) {
    const candidate = new Date(now.getTime() - offset * 60 * 1000);
    const { hhmm } = getDateTimePartsInTimezone(candidate);
    candidates.add(hhmm);
  }

  return [...candidates];
}

function isTaskScheduledForToday(task, todayStamp) {
  if (task.repeatType === "daily") {
    return true;
  }

  if (task.repeatType === "dates") {
    return Array.isArray(task.repeatDates) && task.repeatDates.includes(todayStamp);
  }

  return task.dueDate === todayStamp;
}

function wasAlreadyNotifiedForSlot(task, todayStamp) {
  if (!task.lastNotified) {
    return false;
  }

  const lastNotifiedParts = getDateTimePartsInTimezone(task.lastNotified);
  return lastNotifiedParts.dateStamp === todayStamp && lastNotifiedParts.hhmm === task.time;
}

function startScheduler() {
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        const now = new Date();
        const { dateStamp: todayStamp } = getDateTimePartsInTimezone(now);
        const candidateTimes = getCandidateTimes(now);

        const dueTasks = await Task.find({
          time: { $in: candidateTimes },
          completed: false,
        }).populate("userId", "name email");

        const filteredDueTasks = dueTasks.filter(
          (task) =>
            isTaskScheduledForToday(task, todayStamp) && !wasAlreadyNotifiedForSlot(task, todayStamp)
        );

        for (const task of filteredDueTasks) {
          const user = task.userId;

          if (!user || !user.email) {
            continue;
          }

          try {
            await sendTaskReminderEmail({
              to: user.email,
              name: user.name || "there",
              title: task.title,
            });

            task.lastNotified = now;
            await task.save();
          } catch (emailError) {
            console.error(`[MAIL] Failed for task ${task._id}:`, emailError.message);
          }
        }
      } catch (error) {
        console.error("[CRON] Scheduler error:", error.message);
      }
    },
    { timezone: SCHEDULER_TIMEZONE }
  );

  console.log(
    `[CRON] Reminder scheduler started (every minute) timezone=${SCHEDULER_TIMEZONE} grace=${REMINDER_GRACE_MINUTES}m`
  );
}

module.exports = startScheduler;
