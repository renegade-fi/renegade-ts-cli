import type { Task, TaskInfo } from "@renegade-fi/node";
import chalk from "chalk";
import UI from "cliui";

function formatTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  return chalk.dim(
    date.toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
}

function formatTaskInfo(taskInfo: TaskInfo): string {
  if ("update_type" in taskInfo) {
    return `${taskInfo.update_type} (${chalk.dim(taskInfo.task_type)})`;
  }
  return chalk.dim(taskInfo.task_type);
}

export function formatTaskHistory(tasks: Task[]): string {
  if (tasks.length === 0) {
    return "No tasks found in history";
  }

  const ui = UI({ width: 120, wrap: false });

  // Add title
  ui.div({
    text: chalk.bold("Task History"),
    padding: [1, 0, 1, 0],
  });

  // Add task rows
  tasks.forEach((task) => {
    ui.div(
      { text: formatTime(task.created_at), width: 25, padding: [0, 2, 0, 0] },
      { text: chalk.dim(task.id.toString()), width: 38, padding: [0, 2, 0, 0] },
      { text: formatTaskStatus(task.state), width: 8, padding: [0, 2, 0, 0] },
      {
        text: formatTaskInfo(task.task_info),
        width: 40,
        padding: [0, 0, 0, 0],
      },
    );
  });

  // Add total
  ui.div({
    text: `Showing ${tasks.length} tasks`,
    padding: [1, 0, 0, 0],
  });

  return ui.toString();
}

function formatTaskStatus(state: string): string {
  switch (state.toLowerCase()) {
    case "completed":
      return chalk.green("✓");
    case "failed":
      return chalk.red("✗");
    case "queued":
    case "running":
    case "proving":
    case "proving payment":
    case "submitting tx":
    case "submitting payment":
    case "finding opening":
    case "updating validity proofs":
      return chalk.yellow("⋯");
    default:
      return chalk.gray("?");
  }
}
