import { GravityRocksPage } from './app.po';

describe('gravity-rocks App', function() {
  let page: GravityRocksPage;

  beforeEach(() => {
    page = new GravityRocksPage();
  })

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('gravity-rocks works!');
  });
});
