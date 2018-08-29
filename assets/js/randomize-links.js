(function() {
  var links, random;

  var categories = [
    'learn',
    'create',
    'play',
    'connect',
    'live'
  ];

  random = Math.floor(Math.random() * categories.length) + 0;

  links = document.querySelectorAll('a[href="/"]');
  links.forEach(function(link) {
    link.setAttribute('href', '/' + categories[random] + '/');
  })
})();
