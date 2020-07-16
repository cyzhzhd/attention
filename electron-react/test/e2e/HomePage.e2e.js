var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ClientFunction, Selector } from 'testcafe';
const getPageUrl = ClientFunction(() => window.location.href);
const getPageTitle = ClientFunction(() => document.title);
const counterSelector = Selector('[data-tid="counter"]');
const buttonsSelector = Selector('[data-tclass="btn"]');
const clickToCounterLink = (t) => t.click(Selector('a').withExactText('to Counter'));
const incrementButton = buttonsSelector.nth(0);
const decrementButton = buttonsSelector.nth(1);
const oddButton = buttonsSelector.nth(2);
const asyncButton = buttonsSelector.nth(3);
const getCounterText = () => counterSelector().innerText;
const assertNoConsoleErrors = (t) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = yield t.getBrowserConsoleMessages();
    yield t.expect(error).eql([]);
});
fixture `Home Page`.page('../../app/app.html').afterEach(assertNoConsoleErrors);
test('e2e', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield t.expect(getPageTitle()).eql('Hello Electron React!');
}));
test('should open window and contain expected page title', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield t.expect(getPageTitle()).eql('Hello Electron React!');
}));
test('should not have any logs in console of main window', assertNoConsoleErrors);
test('should navigate to Counter with click on the "to Counter" link', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield t.click('[data-tid=container] > a').expect(getCounterText()).eql('0');
}));
test('should navigate to /counter', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield t.click('a').expect(getPageUrl()).contains('/counter');
}));
fixture `Counter Tests`
    .page('../../app/app.html')
    .beforeEach(clickToCounterLink)
    .afterEach(assertNoConsoleErrors);
test('should display updated count after the increment button click', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield t.click(incrementButton).expect(getCounterText()).eql('1');
}));
test('should display updated count after the descrement button click', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield t.click(decrementButton).expect(getCounterText()).eql('-1');
}));
test('should not change even counter if odd button clicked', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield t.click(oddButton).expect(getCounterText()).eql('0');
}));
test('should change odd counter if odd button clicked', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield t
        .click(incrementButton)
        .click(oddButton)
        .expect(getCounterText())
        .eql('2');
}));
test('should change if async button clicked and a second later', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield t
        .click(asyncButton)
        .expect(getCounterText())
        .eql('0')
        .expect(getCounterText())
        .eql('1');
}));
test('should back to home if back button clicked', (t) => __awaiter(void 0, void 0, void 0, function* () {
    yield t
        .click('[data-tid="backButton"] > a')
        .expect(Selector('[data-tid="container"]').visible)
        .ok();
}));
