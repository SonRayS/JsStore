// Работа с {}
let card = {};
document.querySelectorAll('.add-to-card').forEach(function (element) {
  element.onclick = addToCard;
});

if (localStorage.getItem('card')) {
  card = JSON.parse(localStorage.getItem('card'));
  ajaxGetGoodsInfo();
}

function addToCard() {
  let goodsId = this.dataset.goods_id;
  if (card[goodsId]) {
    card[goodsId]++;
  }
  else {
    card[goodsId] = 1;
  }
  console.log(card);
  ajaxGetGoodsInfo();
}

function ajaxGetGoodsInfo() {
  updateLocalStorageCard();
  fetch('/get-goods-info', {
    method: 'POST',
    body: JSON.stringify({ key: Object.keys(card) }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(function (response) {
      return response.text();
    })
    .then(function (body) {
      console.log(body);
      showCard(JSON.parse(body));
    })
}

function showCard(data) {
  let out = '<table class="table table-striped table-card"><tbody>';
  let total = 0;
  for (let key in card) {
    out += `<tr><td colspan="4" class='movion'><a class='movion' href="/goods?id=${key}">${data[key]['name']}</a></tr>`;
    out += `<tr><td><p class='movions'>К-сть :</p></td><td class='movion'><i class="far fa-minus-square cart-minus" data-goods_id="${key}"></i></td>`;
    out += `<td class='movion'>${card[key]}</td>`;
    out += `<td  class='movion'><class='movion'><i class="far fa-plus-square cart-plus" data-goods_id="${key}"></i></td>`;
    out += '</tr>';
    out += `<tr class='movion'><td><p class='movions'>Ціна : </p></td><td class='movion'>${formatPrice(data[key]['cost'] * card[key])} ₴</td>`
    out += '</tr>';
    total += card[key] * data[key]['cost'];
  }
  out += `<tr><td colspan="1" class='movion-total'>Total: </td><td class='movion-total'>${formatPrice(total)} ₴</td></tr>`;
  out += '</tbody></table>';
  document.querySelector('#card-nav').innerHTML = out;
  document.querySelectorAll('.cart-minus').forEach(function (element) {
    element.onclick = cardMinus;
  });
  document.querySelectorAll('.cart-plus').forEach(function (element) {
    element.onclick = cardPlus;
  });
}

function cardPlus() {
  let goodsId = this.dataset.goods_id;
  card[goodsId]++;
  ajaxGetGoodsInfo();
}

function cardMinus() {
  let goodsId = this.dataset.goods_id;
  if (card[goodsId] - 1 > 0) {
    card[goodsId]--;
  }
  else {
    delete (card[goodsId]);
  }
  ajaxGetGoodsInfo();
}

function formatPrice(price) {
  return price.toFixed().replace(/\d(?=(\d{3})+\.)/g, '$& ');
}

function updateLocalStorageCard() {
  localStorage.setItem('card', JSON.stringify(card));
}