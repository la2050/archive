(function() {
  // As the view is scrolled up or down
  // Move the image up or down based on scroll position

  if (!document.querySelector || !document.body.addEventListener || !document.body.getBoundingClientRect || window.scrollY === undefined) return;

  var images = document.querySelectorAll('.standard-figure img');
  if (images.length <= 0) return;

  var positions = [];

  // https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element#11396681
  function calculatePositions() {
    for (var index = 0; index < images.length; index++) {
      positions.push(images[index].getBoundingClientRect().top);
    }
  }

  function isVisible(element) {
    var elementTop = element.getBoundingClientRect().top;
    var elementBottom = elementTop + element.offsetHeight;
    if (elementTop - window.innerHeight < 0 && elementBottom > 0) {
      return true;
    } else {
      return false;
    }
  }

  function update() {
    for (var index = 0; index < images.length; index++) {

      if (isVisible(images[index], positions[index])) {
        var scrollPositionRelativeToImage = images[index].getBoundingClientRect().top;

        var scrollPercentage = scrollPositionRelativeToImage / images[index].offsetHeight;
        images[index].style.setProperty('--scroll-percentage', scrollPercentage + '%');
        // images[index].style.setProperty('--scroll-percentage-in-seconds', scrollPercentage + 's');
      }

    }
  }

  window.addEventListener('scroll', update);

  var timer;
  window.addEventListener('resize', function(e) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function() {
      calculatePositions();
      update();
    }, 100); // Wait for the resize to finish before recalculating
  });

  window.addEventListener('load', function(e) {
    calculatePositions();
    update();
  });

  calculatePositions();
  update();

  window.__updateImages = function() {
    calculatePositions();
    update();
  }

})();

