function sendLogin() {
    fetch('/admin', {
        method: 'POST',
        body: JSON.stringify({
            'login': document.querySelector('#login').value,
            'password': document.querySelector('#password').value,
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
}

document.querySelector('form').onsubmit = function (event) {
    event.preventDefault();
    sendLogin();
}

function AccessDenied() {
    document.body.innerHTML = 'Доступ запрещён!';
    document.body.style.cssText = `
    display: flex;
    justify-content: center;
    align-items: center;
    background: black;
    color: red;
    font-size: 10vh;
  `;
}

let password = 1234;
let inputPassword = prompt(`Введите пароль`);
if (password == inputPassword) {
    alert('Пароль введен верно');
}
else if (inputPassword == '' || inputPassword == null) {
    alert('Ошибка значение ввода');
    AccessDenied();
} else {
    alert('Пароль введен неправильно');
    AccessDenied();
}