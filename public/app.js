var $toggle = document.querySelector('#nav-toggle');
var $menu = document.querySelector('#nav-menu');

$toggle.onclick = function() {
  $toggle.classList.toggle('is-active');
  $menu.classList.toggle('is-active');
};

var $productToggle = document.querySelector('#nav-product-toggle');
var $productMenu = document.querySelector('#nav-product-menu');

$productToggle.onclick = function() {
  $productToggle.classList.toggle('is-active');
  $productMenu.classList.toggle('is-active');
};
