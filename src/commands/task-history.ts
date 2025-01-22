import { getTaskHistory } from "@renegade-fi/node";
import type { Arguments, CommandBuilder } from "yargs";
import type { Cli } from "../cli";
import { TASK_HISTORY_COMMAND } from "../constants";
import { handleSdkError } from "../errors";
import { formatError } from "../formatters/error";
import { formatTaskHistory } from "../formatters/task";
import { createContext } from "./context";

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
  try {
    const ctx = await createContext(argv);
    const taskMap = await getTaskHistory(ctx.config, {
      limit: argv.limit,
    }).catch((error) => {
      throw handleSdkError(error);
    });

    if (!taskMap || taskMap.size === 0) {
      console.log("No tasks found in history");
      return;
    }

    // Convert map values to array and format
    const tasks = Array.from(taskMap.values());
    console.log(formatTaskHistory(tasks));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
};
