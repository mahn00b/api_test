/** General global types */

/** Numbers */
type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0;
type HexLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
type HexDigit = Digit | HexLetter | Lowercase<HexLetter>;

type HexCode3 = `${HexDigit}${HexDigit}${HexDigit}`;
type HexCode6 = `${HexCode3}${HexCode3}`;
type HexCode8 = `${HexCode6}${HexDigit}${HexDigit}`;
type HexCode = `#${ HexCode3 | HexCode6 | HexCode8 }`;


/* Date */
type ShortMonth = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
type Year = '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30';
type Day = Digit | `${Digit}${Digit}`;

/* Direct wines */
type ReleaseBranchConvention = `release/${Day}${ShortMonth}${Year}`;
