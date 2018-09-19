import { PunchModule } from './punch.module';

describe('PunchModule', () => {
  let punchModule: PunchModule;

  beforeEach(() => {
    punchModule = new PunchModule();
  });

  it('should create an instance', () => {
    expect(punchModule).toBeTruthy();
  });
});
