import { Chalk, ChalkInstance, ForegroundColorName, BackgroundColorName } from 'chalk';

export interface MessageStyle {
    bold?: boolean;

    italic?: boolean;

    underline?: boolean;

    color?: ForegroundColorName;

    bgColor?: BackgroundColorName;
}

/** A simple utility class that wraps around the libraries we use to write to the console */
class Logger {
    console: Console;

    constructor(console: Console) {
        this.console = console;
    }

    /**
     * @description Write a styled message to the console
     * @param message
     */
    log(message: string, style: MessageStyle = {}) {
        this.console.log(Logger.getChalkStyle(style)(message))
    }

    /**
     * @description Use a spinner to indicate that a promise is running. Good for long-running tasks.
     * @param message The message to display while the promise is running
     * @param promise The promise to wait for
     * @returns The result of the promise
     */
    async logWithSpinner<T>(message: string, promise: Promise<T>,  style: MessageStyle = {}): Promise<T> {
        const { oraPromise } = await import('ora');

        return await oraPromise(promise, { text: Logger.getChalkStyle(style)(message) });
    }

    /**
     * @description Accepts a MessageStyle config and returns the corresponding chalk style
     * @param style A config for styling the message
     */
    static getChalkStyle(style: MessageStyle = {}): ChalkInstance {
        let chalkStyle = new Chalk({ level: 3 });

        const { color, bgColor, ...rest } = style;

        if (color) {
            chalkStyle = chalkStyle[color];
        }

        if (bgColor) {
            chalkStyle = chalkStyle[bgColor];
        }

        const styles = Object.keys(rest) as (keyof Omit<MessageStyle, 'color' | 'bgColor'>)[];

        for (const styleName of styles) {
            if (style[styleName]) {
                chalkStyle = chalkStyle[styleName];
            }
        }

        return chalkStyle;
    }
}

export default Logger;
