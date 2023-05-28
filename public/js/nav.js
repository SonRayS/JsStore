document.querySelector('.close-nav').onclick = closeNav;
document.querySelector('.show-nav').onclick = showNav;

function closeNav() {
    document.querySelector('.site-nav').style.left = '-425px';
}
function showNav() {
    document.querySelector('.site-nav').style.left = '0';
}
