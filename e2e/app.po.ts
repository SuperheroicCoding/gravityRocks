export class GravityRocksPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('gravity-rocks-app h1')).getText();
  }
}
