import { getTaskHistory } from "@renegade-fi/node";
import type { Arguments, CommandBuilder } from "yargs";
import ora from "ora";
import type { Cli } from "../cli.js";
import { TASK_HISTORY_COMMAND } from "../constants.js";
import { handleSdkError } from "../errors.js";
import { formatError } from "../formatters/error.js";
import { formatTaskHistory } from "../formatters/task.js";
import { createContext } from "./context.js";

export interface TaskHistoryArgs extends Cli {
  limit?: number;
}

export const command = TASK_HISTORY_COMMAND;
export const desc = "Display task history";

export const builder: CommandBuilder<{}, TaskHistoryArgs> = {
  limit: {
    type: "number",
    description: "Maximum number of tasks to display",
    default: 10,
  },
};

export const handler = async (argv: Arguments<TaskHistoryArgs>) => {
  const spinner = ora("Fetching task history from relayer");
  try {
    const ctx = await createContext(argv);
    spinner.start();
    const taskMap = await getTaskHistory(ctx.config, {
      limit: argv.limit,
    }).catch((error) => {
      throw handleSdkError(error);
    });

    spinner.succeed("Fetched task history from relayer");
    console.log("");

    if (!taskMap || taskMap.size === 0) {
      console.log("No tasks found in history");
      return;
    }

    // Convert map values to array and format
    const tasks = Array.from(taskMap.values());
    console.log(formatTaskHistory(tasks));
  } catch (error) {
    spinner.fail();
    console.error(formatError(error as Error));
    process.exit(1);
  }
};
