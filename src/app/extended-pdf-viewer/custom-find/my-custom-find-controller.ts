import { PDFFindController } from './pdf_find_controller';

export class MyCustomFindController extends PDFFindController {
  constructor({ linkService, eventBus, updateMatchesCountOnProgress = true, pageViewMode, listenToEventBus = true }: any) {
    // Forward listenToEventBus so the secondary instance app.js creates with
    // listenToEventBus:false doesn't double-bind to the "find" event.
    super({ linkService, eventBus, updateMatchesCountOnProgress, pageViewMode, listenToEventBus });
    console.log('MyFindController constructor');
  }

  public onFind(state) {
    console.log('custom onFind', state);
    super.onFind(state);
  }
}
