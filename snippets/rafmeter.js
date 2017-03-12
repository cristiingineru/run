

RAFMeter = function () {

  var meterRafOnOffButton, displayNode, curentTime, curentMozPaintCount,
      previousTime = Date.now(),
      previousMozPaintCount = window.mozPaintCount,
      appRafCallCount = 0,
      meterRafCallCount = 0,
      keepRunningMeterRaf = false,
      displayInterval = 1000,
      originalRequestAnimationFrame = requestAnimationFrame;


  var tickInterval = function() {
    curentTime = Date.now();
    curentMozPaintCount = window.mozPaintCount;

    display();

    previousTime = curentTime;
    previousMozPaintCount = curentMozPaintCount;
    appRafCallCount = 0;
    meterRafCallCount = 0;
  };


  var tickRequestAnimationFrame = function() {
    meterRafCallCount += 1;
    if (keepRunningMeterRaf) {
        originalRequestAnimationFrame(tickRequestAnimationFrame);
    }
  };


  var display = function() {
    var duration = curentTime - previousTime,
        appRafCallsPerSec = (1000 * appRafCallCount / duration).toFixed(1),
        meterRafCallsPerSec = keepRunningMeterRaf ? (1000 * meterRafCallCount / duration).toFixed(1) : NaN,
        mozFps = 1000 * (curentMozPaintCount - previousMozPaintCount) / duration,
        browserFps = mozFps.toFixed(1);
        message = 'spied raf calls / sec: ' + appRafCallsPerSec + '<br />' +
                  'meter raf calls / sec: ' + meterRafCallsPerSec + '<br />' +
                  'browser frames / sec: ' + browserFps;
    if (!displayNode) {
      displayNode = tryCreateDisplayNode();
    }
    if (displayNode) {
      displayNode.innerHTML = message;
    }
  };


  var toggleMeterRaf = function() {
    if(meterRafOnOffButton.checked) {
        keepRunningMeterRaf = true;
        originalRequestAnimationFrame(tickRequestAnimationFrame);
    } else {
        keepRunningMeterRaf = false;
    }
  };


  var insertFirst = function(parent, newChild) {
    if (parent.firstChild) {
      parent.insertBefore(newChild, parent.firstChild);
    } else {
      parent.appendChild(newChild);
    }
  };


  var tryCreateDisplayNode = function() {
    var target = document.body, displayNode;
    if (target) {
        var view = document.createElement('div');
        view.className = 'rafMeter';

        meterRafOnOffButton = document.createElement('input');
        meterRafOnOffButton.type = 'checkbox';
        meterRafOnOffButton.className = 'rafMeter';
        meterRafOnOffButton.onclick = toggleMeterRaf;

        var label = document.createElement('label');
        label.className = 'rafMeter';
        label.innerHTML = 'schedule meter requestAnimationFrame';

        displayNode = document.createElement('div');
        displayNode.className = 'rafMeter';

        view.appendChild(meterRafOnOffButton);
        view.appendChild(label);
        view.appendChild(displayNode);

        insertFirst(target, view);
    }
    return displayNode;
  };


  var fakeRequestAnimationFrame = function(fn) {
    appRafCallCount += 1;
    originalRequestAnimationFrame(fn);
  };


  setInterval(tickInterval, displayInterval);
  requestAnimationFrame = fakeRequestAnimationFrame;
}


if (typeof exports !== 'undefined' && module.exports) {
  module.exports = RAFMeter;
} else {
  window.rafMeter = new RAFMeter();
}
