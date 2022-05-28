document.addEventListener("DOMContentLoaded", function() {
  document.body.classList.add('js');
  var lazyloadImages = document.querySelectorAll(".lazy");
  var lazyloadThrottleTimeout;

  function lazyload () {
    if(lazyloadThrottleTimeout) {
      clearTimeout(lazyloadThrottleTimeout);
    }

    lazyloadThrottleTimeout = setTimeout(function() {
        var scrollTop = window.pageYOffset;
        lazyloadImages.forEach(function(img) {
            if(img.offsetTop < (window.innerHeight + scrollTop)) {
              const z = img.getAttribute('data-img');
              if(z){
                img.style.backgroundImage = 'url(' + z + ')';
              }
              img.classList.remove('lazy');
              img.removeAttribute('data-img');
            }
        });
        if(lazyloadImages.length == 0) {
          document.removeEventListener("scroll", lazyload);
          window.removeEventListener("resize", lazyload);
          window.removeEventListener("orientationChange", lazyload);
        }
    }, 20);
  }
  lazyload();
  document.addEventListener("scroll", lazyload);
  window.addEventListener("resize", lazyload);
  window.addEventListener("orientationChange", lazyload);
});
