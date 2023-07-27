/** General global types */
type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0;
type ShortMonth = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec';
type Year = '20' | '21' | '22' | '23' | '24' | '25' | '26' | '27' | '28' | '29' | '30';
type Day = Digit | `${Digit}${Digit}`;


type ReleaseBranchConvention = `release/${Day}${ShortMonth}${Year}`;
