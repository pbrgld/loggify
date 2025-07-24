/**
 * °Development file°
 * This is used to develop and test the Loggify class without having to add an remove code before and after publishing
 */
import Loggify from "./index";

// Initialize class
const loggify: Loggify = new Loggify();


loggify.console(`Test Object`, 'heartGreen', { context: { id: 'dev', color: 'brightWhite', mode: 'full' } }, { name: 'Paul', age: 41 });
loggify.flush('dev');

loggify.console(`NoLog`, 'heartPurple', { grafanaLoki: {} });