import { ForegroundColorName, BackgroundColorName } from 'chalk';

export interface LoggerStyleConf {
    default: MessageStyle;
    error: MessageStyle;
    completed: MessageStyle;
    check: MessageStyle;
    warning: MessageStyle;
    info: MessageStyle;
}

export interface MessageStyle {
    bold?: boolean;

    italic?: boolean;

    underline?: boolean;

    color?: ForegroundColorName | HexCode;

    bgColor?: BackgroundColorName;
}
/** Nice blue as a default. Probably will change this to something that can contrast well */
export const defaultStyle: MessageStyle = {
    color: '#3090C7'
}

export const errorStyle: MessageStyle = {
    color: 'red'
 };

export const completedStyle: MessageStyle = {
    underline: true,
    color: '#7BCCB5'
}

export const checkStyle: MessageStyle = {
    color: '#7BCCB5'
}

export const warningStyle: MessageStyle = {
    color: 'yellow'
};

export const infoStyle: MessageStyle = {
    ...defaultStyle,
};

export const styles  = {
    default: defaultStyle,
    error: errorStyle,
    completed: completedStyle,
    check: checkStyle,
    warning: warningStyle,
    info: infoStyle,
}
