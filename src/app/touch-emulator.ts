/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * create an touch point
 * @constructor
 * @param target
 * @param identifier
 * @param pos
 * @param deltaX
 * @param deltaY
 * @returns {Object} touchPoint
 */
class Touch {
  public clientX: number;
  public clientY: number;
  public pageX: number;
  public pageY: number;
  public screenX: number;
  public screenY: number;

  constructor(public target, public identifier, pos, deltaX = 0, deltaY = 0) {
    deltaX = deltaX || 0;
    deltaY = deltaY || 0;

    this.identifier = identifier;
    this.target = target;
    this.clientX = pos.clientX + deltaX;
    this.clientY = pos.clientY + deltaY;
    this.screenX = pos.screenX + deltaX;
    this.screenY = pos.screenY + deltaY;
    this.pageX = pos.pageX + deltaX;
    this.pageY = pos.pageY + deltaY;
  }
}

/*
class TouchList extends Array<any> {
  /**
   * create empty touchlist with the methods
   * @constructor
   * @returns touchList
   */
/*
  constructor() {
    super([]);
  }

  public item(index) {
    return this[index] || null;
  }

  // specified by Mozilla
  public identifiedTouch(id) {
    return this[id + 1] || null;
  }

}
*/

/**
 * create empty touchlist with the methods
 * @constructor
 * @returns touchList
 */

function createEmptyTouchList(): TouchList | Touch[] {
  const touchList: Touch[] = [];

  (touchList as any).item = function (index) {
    return this[index] || null;
  };

  // specified by Mozilla
  (touchList as any).identifiedTouch = function (id) {
    return this[id + 1] || null;
  };
  return touchList;
}

export class TouchEmulator {
  private isMultiTouch = false;
  private multiTouchStartPos;
  private touchElements = {};
  private lastAlt: number | undefined;
  public static active = false;
  private eventTarget: EventTarget | null = null;

  // start distance when entering the multitouch mode
  private multiTouchOffset = 75;

  constructor() {
    // polyfills
    if (this.isBrowser()) {
      if (!(document as any).createTouch) {
        (document as any).createTouch = function (view, target, identifier, pageX, pageY, screenX, screenY, clientX, clientY) {
          // auto set
          if (clientX == undefined || clientY == undefined) {
            clientX = pageX - globalThis.pageXOffset;
            clientY = pageY - globalThis.pageYOffset;
          }

          return new Touch(target, identifier, {
            pageX: pageX,
            pageY: pageY,
            screenX: screenX,
            screenY: screenY,
            clientX: clientX,
            clientY: clientY,
          });
        };
      }

      if (!(document as any).createTouchList) {
        (document as any).createTouchList = function () {
          const touchList = createEmptyTouchList();
          for (const argument of arguments) {
            (touchList as Touch[]).push(argument);
          }
          return touchList;
        };
      }
      if (this.hasTouchSupport()) {
        return;
      }

      this.fakeTouchSupport();

      globalThis.addEventListener('keydown', this.toggleTouch, true);

      globalThis.addEventListener('mousedown', (event) => this.onMouse('touchstart')(event), true);
      globalThis.addEventListener('mousemove', (event) => this.onMouse('touchmove')(event), true);
      globalThis.addEventListener('mouseup', (event) => this.onMouse('touchend')(event), true);

      globalThis.addEventListener('mouseenter', (event) => this.preventMouseEvents(event), true);
      globalThis.addEventListener('mouseleave', (event) => this.preventMouseEvents(event), true);
      globalThis.addEventListener('mouseout', (event) => this.preventMouseEvents(event), true);
      globalThis.addEventListener('mouseover', (event) => this.preventMouseEvents(event), true);

      // it uses itself!
      globalThis.addEventListener('touchstart', (event) => this.showTouches(event), true);
      globalThis.addEventListener('touchmove', (event) => this.showTouches(event), true);
      globalThis.addEventListener('touchend', (event) => this.showTouches(event), true);
      globalThis.addEventListener('touchcancel', (event) => this.showTouches(event), true);
      console.log('Touch gesture emulation has been enabled.');
      console.log('Hit the ALT or OPTION key twice in a second to active touch gestures. Caveat: this disables your mouse.');
      console.log('Hitting the ALT or OPTION key twice again deactivates touch gestures again and allow you to use your mouse again.');
    }
  }

  /**
   * Simple trick to fake touch event support
   * this is enough for most libraries like Modernizr and Hammer
   */
  private fakeTouchSupport() {
    const objs = [window, document.documentElement];
    const props = ['ontouchstart', 'ontouchmove', 'ontouchcancel', 'ontouchend'];

    for (const obj of objs) {
      for (const prop of props) {
        if (obj && obj[prop] == undefined) {
          obj[prop] = null;
        }
      }
    }
  }

  /**
   * we don't have to emulate on a touch device
   * @returns {boolean}
   */
  private hasTouchSupport() {
    if (typeof window === 'undefined') {
      // server-side rendering
      return false;
    }
    return (
      'ontouchstart' in window || // touch events
      // (globalThis.Modernizr && globalThis.Modernizr.touch) || // modernizr
      navigator?.maxTouchPoints > 2
    ); // pointer events
  }

  /**
   * disable mouseevents on the page
   * @param ev
   */
  private preventMouseEvents(ev): void {
    ev.preventDefault();
    ev.stopPropagation();
  }

  private toggleTouch(ev) {
    if (ev.altKey) {
      const currentAlt = new Date().getTime();
      if (this.lastAlt) {
        if (currentAlt - this.lastAlt < 1000) {
          TouchEmulator.active = !TouchEmulator.active;
          if (TouchEmulator.active) {
            console.log('simulating touch events');
          } else {
            console.log('Back to mouse events');
          }
        }
      }
      this.lastAlt = currentAlt;
    }
  }

  /**
   * only trigger touches when the left mousebutton has been pressed
   * @param touchType
   * @returns {Function}
   */
  private onMouse(touchType) {
    return (ev: MouseEvent) => {
      if (!TouchEmulator.active) return;

      // prevent mouse events
      this.preventMouseEvents(ev);

      if (ev.which !== 1) {
        return;
      }

      // The EventTarget on which the touch point started when it was first placed on the surface,
      // even if the touch point has since moved outside the interactive area of that element.
      // also, when the target doesnt exist anymore, we update it
      if (ev.type == 'mousedown' || !this.eventTarget || (this.eventTarget && !this.eventTarget.dispatchEvent)) {
        this.eventTarget = ev.target;
      }

      // shiftKey has been lost, so trigger a touchend
      if (this.isMultiTouch && !ev.shiftKey) {
        this.triggerTouch('touchend', ev);
        this.isMultiTouch = false;
      }

      this.triggerTouch(touchType, ev);

      // we're entering the multi-touch mode!
      if (!this.isMultiTouch && ev.shiftKey) {
        this.isMultiTouch = true;
        this.multiTouchStartPos = {
          pageX: ev.pageX,
          pageY: ev.pageY,
          clientX: ev.clientX,
          clientY: ev.clientY,
          screenX: ev.screenX,
          screenY: ev.screenY,
        };
        this.triggerTouch('touchstart', ev);
      }

      // reset
      if (ev.type == 'mouseup') {
        this.multiTouchStartPos = null;
        this.isMultiTouch = false;
        this.eventTarget = null;
      }
    };
  }

  /**
   * trigger a touch event
   * @param eventName
   * @param mouseEv
   */
  private triggerTouch(eventName, mouseEv) {
    const touchEvent = document.createEvent('Event');
    touchEvent.initEvent(eventName, true, true);

    (touchEvent as any).altKey = mouseEv.altKey;
    (touchEvent as any).ctrlKey = mouseEv.ctrlKey;
    (touchEvent as any).metaKey = mouseEv.metaKey;
    (touchEvent as any).shiftKey = mouseEv.shiftKey;

    (touchEvent as any).touches = this.getActiveTouches(mouseEv, eventName);
    (touchEvent as any).targetTouches = this.getActiveTouches(mouseEv, eventName);
    (touchEvent as any).changedTouches = this.getChangedTouches(mouseEv, eventName);

    this.eventTarget?.dispatchEvent(touchEvent);
  }

  /**
   * create a touchList based on the mouse event
   * @param mouseEv
   * @returns {TouchList}
   */
  private createTouchList(mouseEv) {
    const touchList = createEmptyTouchList();

    if (this.isMultiTouch) {
      const f = this.multiTouchOffset;
      const deltaX = this.multiTouchStartPos.pageX - mouseEv.pageX;
      const deltaY = this.multiTouchStartPos.pageY - mouseEv.pageY;

      (touchList as Touch[]).push(new Touch(this.eventTarget, 1, this.multiTouchStartPos, deltaX * -1 - f, deltaY * -1 + f));
      (touchList as Touch[]).push(new Touch(this.eventTarget, 2, this.multiTouchStartPos, deltaX + f, deltaY - f));
    } else {
      (touchList as Touch[]).push(new Touch(this.eventTarget, 1, mouseEv, 0, 0));
    }

    return touchList;
  }

  /**
   * receive all active touches
   * @param mouseEv
   * @returns {TouchList}
   */
  private getActiveTouches(mouseEv, eventName) {
    // empty list
    if (mouseEv.type == 'mouseup') {
      return createEmptyTouchList();
    }

    const touchList = this.createTouchList(mouseEv);
    if (this.isMultiTouch && mouseEv.type != 'mouseup' && eventName == 'touchend') {
      (touchList as Touch[]).splice(1, 1);
    }
    return touchList;
  }

  /**
   * receive a filtered set of touches with only the changed pointers
   * @param mouseEv
   * @param eventName
   * @returns {TouchList}
   */
  private getChangedTouches(mouseEv, eventName) {
    const touchList = this.createTouchList(mouseEv);

    // we only want to return the added/removed item on multitouch
    // which is the second pointer, so remove the first pointer from the touchList
    //
    // but when the mouseEv.type is mouseup, we want to send all touches because then
    // no new input will be possible
    if (this.isMultiTouch && mouseEv.type != 'mouseup' && (eventName == 'touchstart' || eventName == 'touchend')) {
      (touchList as Touch[]).splice(0, 1);
    }

    return touchList;
  }

  /**
   * show the touchpoints on the screen
   */
  private showTouches(ev: TouchEvent) {
    let touch, i, el, styles;

    // first all visible touches
    for (i = 0; i < ev.touches.length; i++) {
      touch = ev.touches[i];
      el = this.touchElements[touch.identifier];
      if (!el) {
        el = this.touchElements[touch.identifier] = document.createElement('div');
        document.body.appendChild(el);
      }

      styles = this.template(touch);
      for (const prop in styles) {
        el.style[prop] = styles[prop];
      }
    }

    // remove all ended touches
    if (ev.type == 'touchend' || ev.type == 'touchcancel') {
      for (i = 0; i < ev.changedTouches.length; i++) {
        touch = ev.changedTouches[i];
        el = this.touchElements[touch.identifier];
        if (el) {
          el.parentNode.removeChild(el);
          delete this.touchElements[touch.identifier];
        }
      }
    }
  }

  /**
   * TouchEmulator initializer
   */

  /**
   * css template for the touch rendering
   * @param touch
   * @returns object
   */
  private template(touch) {
    const size = 30;
    const transform = 'translate(' + (touch.clientX - size / 2) + 'px, ' + (touch.clientY - size / 2) + 'px)';
    return {
      position: 'fixed',
      left: 0,
      top: 0,
      background: '#fff',
      border: 'solid 1px #999',
      opacity: 0.6,
      borderRadius: '100%',
      height: size + 'px',
      width: size + 'px',
      padding: 0,
      margin: 0,
      display: 'block',
      overflow: 'hidden',
      pointerEvents: 'none',
      webkitUserSelect: 'none',
      mozUserSelect: 'none',
      userSelect: 'none',
      webkitTransform: transform,
      mozTransform: transform,
      transform: transform,
      zIndex: 100,
    };
  }

  /**
   * Checks if the code is running in a browser environment.
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}
