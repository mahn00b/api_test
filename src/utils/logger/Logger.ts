import ora from 'ora';
import inquirer, { Question, QuestionCollection } from 'inquirer';
import { Chalk, ChalkInstance, ForegroundColorName } from 'chalk';
import {
    MessageStyle,
    styles,
    LoggerStyleConf
} from './LogStyles';
import { CHECK_MARK } from '../../constants';


/** A simple utility class that wraps around the libraries we use to write to the console */
class Logger {
    private console: Console;
    private lastSpinnerMessage: string;
    private spinner: any;
    private styles: LoggerStyleConf = styles;

    constructor(console: Console, customStyles: Partial<LoggerStyleConf> = {}) {
        /** TODO: This should be a generic write stream that the user can pass into the constructor. One day... */
        this.console = console;
        this.lastSpinnerMessage = '';

        this.styles = {
            ...styles,
            ...customStyles,
        }
    }

    /**
     * @description Write a styled message to the console
     * @param message
     */
    log(message: string, style?: MessageStyle) {
        this.console.log(Logger.getChalkStyle(style ?? this.styles.default)(message))
    }

    /**
     * @description Write a error message to the console
     * @param message
     * @param style
     */
    error(message: string, style?: MessageStyle) {
        this.console.error(Logger.getChalkStyle(style ?? this.styles.error)(message))
    }

    /**
     * @description Write a warning message to the console
     * @param message
     * @param style
     */
    warn(message: string, style?: MessageStyle) {
        this.console.warn(Logger.getChalkStyle(style ?? this.styles.warning)(message))
    }

    /**
     * @description Write a info message to the console
     * @param message
     * @param style
     */
    info(message: string, style?: MessageStyle) {
        this.console.info(Logger.getChalkStyle(style ?? this.styles.warning)(message))
    }

    /**
     * @description Use a spinner to indicate that a promise is running. Good for long-running tasks.
     * @param promise A callback that returns a promise
     * @param startMessage The message to display when the promise starts
     * @param endMessage The message to display when the promise ends
     * @returns The result of the promise
     */
    async logWithSpinner<T>(promise: () => Promise<T>, startMessage: string, endMessage: string): Promise<T> {
        await this.startSpinner(startMessage, this.styles.default);

        const result = await promise();

        this.stopSpinner(endMessage, this.styles.completed);

        return result;
    }

    /**
     * @description Use a spinner to indicate that a promise is running. Good for long-running tasks.
     * Will automatically stop any previous spinners.
     * @param message
     * @param style
     */
    async startSpinner(message: string, style?: MessageStyle) {
        if (this.spinner) {
            this.stopSpinner(this.lastSpinnerMessage);
        }

        this.lastSpinnerMessage = message;
        this.spinner = ora({ text: Logger.getChalkStyle(style ?? this.styles.default)(message) });
    }

    /**
     * @description Stop the spinner and optionally persist a message by passing one in
     * @param message
     * @param style
     */
    stopSpinner(message?: string, style?: MessageStyle) {
        if (this.spinner) {
            if (message) {
                this.spinner.stopAndPersist({
                    symbol: Logger.getChalkStyle(this.styles.check)(CHECK_MARK),
                    text: Logger.getChalkStyle(style ?? this.styles.completed)(message),
                });
            } else {
                this.spinner.stop();
            }

            this.spinner = null;
        }
    }

    /**
     * @description Update the current spinner message
     * @param message
     * @param style
     */
    async updateSpinner(message: string, style: MessageStyle) {
        if (!this.spinner) {
            await this.startSpinner(message, style);
        } else {
            this.spinner.text = Logger.getChalkStyle(style ?? this.styles.completed)(message);
        }

        this.lastSpinnerMessage = message;
    }

    /**
     * @description Accepts a MessageStyle config and returns the corresponding chalk style
     * @param style A config for styling the message
     */
    static getChalkStyle(style: MessageStyle = {}): ChalkInstance {
        let chalkStyle = new Chalk({ level: 3 });

        const { color, bgColor, ...rest } = style;

        if (color) {
            chalkStyle = color.startsWith('#') ? chalkStyle.hex(color) : chalkStyle[color as ForegroundColorName];
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

    /**
     * @description Write a styled message to the console
     * @param message
    */
    static async prompt(questions: QuestionCollection, style?: MessageStyle) {
        return await inquirer.prompt((questions as Question[]).map((question) => {
            if (question.message) {
                question.message = Logger.getChalkStyle(style ?? styles.default)(question.message);
            }

            return question;
        }));
    }
}

export default Logger;
