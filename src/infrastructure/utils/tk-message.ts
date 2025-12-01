import chalk from "chalk";

export class TkMessage {
  static success = (message: string) => console.log(chalk.green(message));
  static error = (message: string) => console.log(chalk.red.underline(message));
  static info = (message: string) => console.log(chalk.blue(message));
  static warn = (message: string) => console.log(chalk.yellow(message));
  static warning = (message: string) => console.log(chalk.yellow.bold(message));
  static debug = (message: string) => console.log(chalk.gray(message));
  static http = (
    method: string,
    statusCode: number,
    url: string,
    ms: number
  ) => {
    let statusColor = chalk.white;
    if (statusCode >= 500) statusColor = chalk.blue;
    else if (statusCode >= 400) statusColor = chalk.red;
    else if (statusCode >= 300) statusColor = chalk.cyan;
    else if (statusCode >= 200) statusColor = chalk.green;

    console.log(
      `${chalk.blue(method)} - ${chalk.magenta(url)} - ${statusColor(
        statusCode.toString()
      )} - ${chalk.yellow(ms + "ms")}`
    );
  };
}
