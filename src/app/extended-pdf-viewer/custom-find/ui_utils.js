/* Copyright 2012 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Scrolls specified element into view of its parent.
 * @param {HTMLElement} element - The element to be visible.
 * @param {Object} [spot] - An object with optional top and left properties,
 *   specifying the offset from the top left edge.
 * @param {number} [spot.left]
 * @param {number} [spot.top]
 * @param {boolean} [scrollMatches] - When scrolling search results into view,
 *   ignore elements that either: Contains marked content identifiers,
 *   or have the CSS-rule `overflow: hidden;` set. The default value is `false`.
 */
// #492 modified by ngx-extended-pdf-viewer
function scrollIntoView(element, spot, scrollMatches = false, infiniteScroll=false) {
// #492 end of modification
  // Assuming offsetParent is available (it's not available when viewer is in
  // hidden iframe or object). We have to scroll: if the offsetParent is not set
  // producing the error. See also animationStarted.

  // #716 modified by ngx-extended-pdf-viewer
  if (
    element.classList.contains("stf__item") ||
    element.parentElement?.classList.contains("stf__item") ||
    element.parentElement?.parentElement?.classList.contains("stf__item")
  ) {
    // NgxConsole.log("don't scroll in book mode");
    return;
  }
  // #716 end of modification

  let parent = element.offsetParent;
  if (!parent) {
    NgxConsole.error("offsetParent is not set -- cannot scroll");
    return;
  }
  let offsetY = element.offsetTop + element.clientTop;
  let offsetX = element.offsetLeft + element.clientLeft;
  while (
    (parent.clientHeight === parent.scrollHeight &&
      parent.clientWidth === parent.scrollWidth) ||
    (scrollMatches &&
      (parent.classList.contains("markedContent") ||
        getComputedStyle(parent).overflow === "hidden"))
  ) {
    offsetY += parent.offsetTop;
    offsetX += parent.offsetLeft;

    parent = parent.offsetParent;
    if (!parent) {
      // modified by ngx-extended-pdf-viewer #492
      if (infiniteScroll) {
        if (document.body.clientHeight > offsetY) {
          // infinite scroll
          offsetY -= 32;
          window.scrollTo(window.scrollX, offsetY);
        }
      }
      // end of modification #492
      return; // no need to scroll
    }
  }
  if (spot) {
    if (spot.top !== undefined) {
      offsetY += spot.top;
    }
    if (spot.left !== undefined) {
      offsetX += spot.left;
      parent.scrollLeft = offsetX;
    }
  // #1823 modified by ngx-extended-pdf-viewer
  } else if (isDivInViewport(element)) {
    return; // no need to scroll
  // #1823 end of modification by ngx-extended-pdf-viewer
  }
  parent.scrollTop = offsetY;
}

// #1823 modified by ngx-extended-pdf-viewer
function isDivInViewport(element) {
  const rect = element.getBoundingClientRect();

  // Check if the element is within the viewport's boundaries.
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
// #1823 end of modification by ngx-extended-pdf-viewer


/**
 * Use binary search to find the index of the first item in a given array which
 * passes a given condition. The items are expected to be sorted in the sense
 * that if the condition is true for one item in the array, then it is also true
 * for all following items.
 *
 * @returns {number} Index of the first array element to pass the test,
 *                   or |items.length| if no such element exists.
 */
function binarySearchFirstItem(items, condition, start = 0) {
  let minIndex = start;
  let maxIndex = items.length - 1;

  if (maxIndex < 0 || !condition(items[maxIndex])) {
    return items.length;
  }
  if (condition(items[minIndex])) {
    return minIndex;
  }

  while (minIndex < maxIndex) {
    const currentIndex = (minIndex + maxIndex) >> 1;
    const currentItem = items[currentIndex];
    if (condition(currentItem)) {
      maxIndex = currentIndex;
    } else {
      minIndex = currentIndex + 1;
    }
  }
  return minIndex; /* === maxIndex */
}

export { scrollIntoView, binarySearchFirstItem };
