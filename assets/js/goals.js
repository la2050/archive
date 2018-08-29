
(function() {
  if (!document.querySelector || !document.body.addEventListener || !document.body.classList) return;

  // The about navigation isn’t working in Opera Mini, at present
  if (/Opera/.test (navigator.userAgent)) return;


  var goalsContainer = document.getElementById('goals-container');
  if (!goalsContainer) return;

  var buttonsContainer = goalsContainer.querySelector('.navigation ul');
  if (!buttonsContainer) return;

  var buttons = buttonsContainer.querySelectorAll('a');

  var goals = goalsContainer.querySelectorAll('section');


  function hideAllExcept(id) {

    // Hide all of the goals except the first one
    for (var index = 0; index < goals.length; index++) {
      if (goals[index].id === id) {
        goals[index].classList.remove('hidden');
      } else {
        goals[index].classList.add('hidden');
      }
    }
  }

  function closest(element, tagName) {

    // If the element is the target
    if (element.nodeName.toLowerCase() === tagName) return element;

    var ancestor = element;
    while ((ancestor = ancestor.parentElement) && ancestor.nodeName && ancestor.nodeName.toLowerCase() !== tagName);
    if (ancestor && ancestor.nodeName && ancestor.nodeName.toLowerCase() === tagName) {
      return ancestor;
    }
  }

  var currentLink;

  if (goals.length > 1 && goals.length === buttons.length) {

    // If a link is pressed
    buttonsContainer.addEventListener('click', function(e) {

      var link = closest(e.target, 'a');

      if (link) {
        // Hide all of the goals except the one that was chosen
        hideAllExcept(link.getAttribute('href').replace('#', ''));
        if (currentLink) currentLink.classList.remove('active');
        currentLink = link;
        currentLink.classList.add('active');

        if (window.__updateImages) window.__updateImages();

        // TODO: Base this on whether the section title is in view
        // if (window.innerHeight > 600 && window.innerWidth > 600) {
          e.preventDefault();
        // }
      }

    }, false);

    // https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript#answer-7228322
    function randomIntFromInterval(min,max) {
      return Math.floor(Math.random()*(max-min+1)+min);
    }

    var random = randomIntFromInterval(0, goals.length - 1);

    hideAllExcept(goals[random].getAttribute('id'));
    currentLink = buttonsContainer.querySelectorAll('a')[random];
    currentLink.classList.add('active');


    (function() {

      function isVisible(element) {
        var elementTop = element.getBoundingClientRect().top;
        var elementBottom = elementTop + element.offsetHeight;
        if (elementTop - window.innerHeight < 0 && elementBottom > 0) {
          return true;
        } else {
          return false;
        }
      }

      function isMostlyVisible(element) {
        var elementTop = element.getBoundingClientRect().top;
        var elementBottom = elementTop + element.offsetHeight;
        if (elementTop - window.innerHeight < (-(window.innerHeight) / 2) && elementBottom > 0) {
          return true;
        } else {
          return false;
        }
      }

      var timeout;

      var userInteracted = false;
      buttonsContainer.addEventListener('click', function() {
        userInteracted = true;
        clearTimeout(timeout);
        timeout = undefined;
      }, false)

      var goalsPosition;
      function calculatePositions() {
        // goalsPosition = buttonsContainer.getBoundingClientRect().top;
        // console.log('goalsPosition: ' + goalsPosition);
      }

      function _update() {

        // If the top of the goals area is visible, but the rest of the goals area is barely visible
        // And if the user has not yet interacted with the goals area
        if (!isVisible(buttonsContainer) || isMostlyVisible(goalsContainer.querySelector('section:not(.hidden)')) || userInteracted) return;

        var linkItem = closest(currentLink, 'li');

        // Get the next item element
        var nextGoalItem = linkItem;
        do {
          nextGoalItem = nextGoalItem.nextSibling;
        } while(nextGoalItem && nextGoalItem.nodeType !== Node.ELEMENT_NODE);

        // Or use the first item element in the list
        if (!nextGoalItem || nextGoalItem === linkItem) nextGoalItem = closest(currentLink, 'ul').querySelector('li:first-child');

        // Show the next goal item
        if (nextGoalItem) {
          var items = buttonsContainer.querySelectorAll('li');
          for (var index = 0; index < items.length; index++) {
            if (items[index] === nextGoalItem) {

              hideAllExcept(goals[index].getAttribute('id'));
              if (currentLink) currentLink.classList.remove('active');
              currentLink = buttonsContainer.querySelectorAll('a')[index];
              currentLink.classList.add('active');

              if (window.__updateImages) window.__updateImages();
            }
          }
        }
        timeout = setTimeout(_update, 5000);
      }

      function update() {

        // Switch to the next goal automatically, every few seconds
        if (timeout) {
          // If the top of the goals area is visible, but the rest of the goals area is barely visible
          // And if the user has not yet interacted with the goals area
          if (!isVisible(buttonsContainer) || isMostlyVisible(goalsContainer.querySelector('section:not(.hidden)')) || userInteracted) {

            clearTimeout(timeout);
            timeout = undefined;
          }
          return;
        }

        clearTimeout(timeout);
        timeout = setTimeout(_update, 1000);
      }

      window.addEventListener('scroll', update);

      (function() {
        var timer;
        window.addEventListener('resize', function(e) {
          if (timer) clearTimeout(timer);
          timer = setTimeout(function() {
            calculatePositions();
            update();
          }, 100); // Wait for the resize to finish before recalculating
        });
      })();

      window.addEventListener('load', function(e) {
        calculatePositions();
        update();
      });

      calculatePositions();
      update();
    })();

  }
})();
