/**
 * °Development file°
 * This is used to develop and test the Loggify class without having to add an remove code before and after publishing
 */
import Loggify from "./index";

// Initialize class
const loggify: Loggify = new Loggify({
    logTypeBadge: 'emoji',
    logMemoryUsage: false,
    logCallerInformation: true

});

// Emoji Test
// Common
loggify.console(`Emoji test => okay`, 'okay');
loggify.console(`Emoji test => success`, 'success');
loggify.console(`Emoji test => info`, 'info');
loggify.console(`Emoji test => warn`, 'warn');
loggify.console(`Emoji test => warning`, 'warning');
loggify.console(`Emoji test => error`, 'error');
loggify.console(`Emoji test => create`, 'create');
loggify.console(`Emoji test => add`, 'add');
loggify.console(`Emoji test => remove`, 'remove');

// Specials
loggify.console(`Emoji test => connect`, 'connect');
loggify.console(`Emoji test => timer`, 'timer');
loggify.console(`Emoji test => metrics`, 'metrics');
loggify.console(`Emoji test => explosion`, 'explosion');
loggify.console(`Emoji test => fuck`, 'fuck');
loggify.console(`Emoji test => shit`, 'shit');
loggify.console(`Emoji test => star`, 'star');
loggify.console(`Emoji test => rocket`, 'rocket');
loggify.console(`Emoji test => init`, 'init');
loggify.console(`Emoji test => finished`, 'finished');
loggify.console(`Emoji test => upload`, 'upload');
loggify.console(`Emoji test => download`, 'download');
loggify.console(`Emoji test => fingerprint`, 'fingerprint');
loggify.console(`Emoji test => secure`, 'secure');
loggify.console(`Emoji test => debug`, 'debug');
loggify.console(`Emoji test => smiley`, 'smiley');

// Hearts
loggify.console(`Emoji test => heart`, 'heart');
loggify.console(`Emoji test => heartBroken`, 'heartBroken');
loggify.console(`Emoji test => heartMagenta`, 'heartMagenta');
loggify.console(`Emoji test => heartRed`, 'heartRed');
loggify.console(`Emoji test => heartOrange`, 'heartOrange');
loggify.console(`Emoji test => heartYellow`, 'heartYellow');
loggify.console(`Emoji test => heartGreen`, 'heartGreen');
loggify.console(`Emoji test => heartCyan`, 'heartCyan');
loggify.console(`Emoji test => heartBlue`, 'heartBlue');
loggify.console(`Emoji test => heartPurple`, 'heartPurple');
loggify.console(`Emoji test => heartBlack`, 'heartBlack');
loggify.console(`Emoji test => heartGray`, 'heartGray');
loggify.console(`Emoji test => heartWhite`, 'heartWhite');
loggify.console(`Emoji test => heartBrown`, 'heartBrown');

// Circles
loggify.console(`Emoji test => circleRed`, 'circleRed');
loggify.console(`Emoji test => circleOrange`, 'circleOrange');
loggify.console(`Emoji test => circleYellow`, 'circleYellow');
loggify.console(`Emoji test => circleGreen`, 'circleGreen');
loggify.console(`Emoji test => circleBlue`, 'circleBlue');
loggify.console(`Emoji test => circlePurple`, 'circlePurple');
loggify.console(`Emoji test => circleBlack`, 'circleBlack');
loggify.console(`Emoji test => circleWhite`, 'circleWhite');
loggify.console(`Emoji test => circleBrown`, 'circleBrown');

// Squares
loggify.console(`Emoji test => squareRed`, 'squareRed');
loggify.console(`Emoji test => squareOrange`, 'squareOrange');
loggify.console(`Emoji test => squareYellow`, 'squareYellow');
loggify.console(`Emoji test => squareGreen`, 'squareGreen');
loggify.console(`Emoji test => squareBlue`, 'squareBlue');
loggify.console(`Emoji test => squarePurple`, 'squarePurple');
loggify.console(`Emoji test => squareBlack`, 'squareBlack');
loggify.console(`Emoji test => squareWhite`, 'squareWhite');
loggify.console(`Emoji test => squareBrown`, 'squareBrown');

loggify.console(`Test Object`, 'heartGreen', { context: { id: 'dev', color: 'brightCyan', mode: 'full' } }, { name: 'Paul', age: 41 });

loggify.console(`Emoji Test create`, 'create', { context: { id: 'dev' } });
loggify.console(`Emoji Test add`, 'add', { context: { id: 'dev' } });
loggify.console(`Emoji Test remove`, 'remove', { context: { id: 'dev' } });


loggify.flush('dev');

loggify.console(`NoLog`, 'heartPurple', { grafanaLoki: {} });

function myFunction(): void {
    loggify.console(`This is a log from inside the function`, 'create', { callerInformation: { overwriteCallerStackLevel: 0 } });
    loggify.console(`For this log the function information has been hidden`, 'info', { callerInformation: { overwriteCallerStackLevel: 0, hideFunctionInfo: true } });
}
myFunction();
loggify.console(`Thank you for chosing Loggify [emoji:smiley]      [[ansi:cyan]logTypeBadge:[ansi:reset] [ansi:orange]"emoji"[ansi:reset]]`, 'success');
loggify.console(`Use custom log badge types`, 'custom=[ansi:orange][ansi:inverse]=myTag');

loggify.banner(`[emoji:star] I am some simple plain text to be printed`, { frame: { color: "green" } });
loggify.banner({
    title: '[emoji:okay] I am a banner [emoji:warn]', description: `[ansi:blue]This is some text that should be rendered.[ansi:reset] Lets get some new stuff into this:
    \t1. this
    \t2. that
    \t3. and that
Finally there is some additional line break to be added\nOther things may come equally. And now we need to fill in a really long text to make sure the linebreak feature is correctly implemented. Well, in the end it should look great, or? What do you think this will look like, [ansi:yellow]if you do not put in any effort to make this a nice and neat looking feature? Well, in the end this is mostly done for myself, but hey, I am the most important person to bring this joy of using Loggify to and I am very happy for every other person to use it as well, but I [ansi:reset]have to like and love it. If someone reads this, this is just some silly text to implement the line break feature [emoji:smiley]` }, { frame: { color: "red" } });