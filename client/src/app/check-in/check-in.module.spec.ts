import {CheckInModule} from "./check-in.module";

describe('CheckInModule', () => {
  let punchModule: CheckInModule;

  beforeEach(() => {
    punchModule = new CheckInModule();
  });

  it('should create an instance', () => {
    expect(punchModule).toBeTruthy();
  });
});
