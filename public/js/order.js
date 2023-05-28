document.querySelector('#lite-shop-order').onsubmit = function (event) {
    event.preventDefault();
    let username = document.querySelector('#username').value.trim();
    let phone = document.querySelector('#phone').value.trim();
    let email = document.querySelector('#email').value.trim();
    let address = document.querySelector('#address').value.trim();

    if (!document.querySelector('#rule').checked) {
        //с правилами не согласен
        Swal.fire({
            title: 'Помилка !',
            text: 'Прочитайте та прийміть правила',
            type: 'info',
            confirmButtonText: 'ОК'
        });
        return false;
    }

    if (username == '' || phone == '' || email == '' || address == '') {
        //не заполнены поля
        Swal.fire({
            title: 'Помилка !',
            text: 'Заповніть всі поля',
            type: 'info',
            confirmButtonText: 'ОК'
        });
        return false;
    }
    

    fetch('/finish-order', {
        method: 'POST',
        body: JSON.stringify({
            'username': username,
            'phone': phone,
            'address': address,
            'email': email,
            'key': JSON.parse(localStorage.getItem('card'))
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(function (response) {
        return response.text();
    })
    .then(function (body) {
        if (body == 1) {
            Swal.fire({
                title: 'Готово',
                text: 'ок',
                type: 'info',
                confirmButtonText: 'ОК'
            });
        }
        else {
            Swal.fire({
                title: 'Помилка відправки',
                text: 'Помилка !',
                type: 'помилка',
                confirmButtonText: 'ОК'
            });
        }
    })
}
