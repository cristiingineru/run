window.results = window.results || {};

setInterval(function() {
  var displayNode = $('div.rafMeter')[0];
  if (displayNode) {
    window.results.rafMeter = $('div.rafMeter')[0].innerHTML;
  }
}, 1000);
