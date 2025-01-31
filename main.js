const DEAL_GET_URL = 'https://b24-jba6eg.bitrix24.ru/rest/9/23b68t00p06lvt02/crm.deal.get.json';
const FIELDS_UPDATE_URL = 'https://b24-jba6eg.bitrix24.ru/rest/9/tl3rca5fkp58k52s/crm.deal.productrows.set.json';

const chooseHeaderList = document.querySelector(".header__list");
// Добавление новой строки
document.querySelector(".header__add").addEventListener("click", (event) => {
  const createElement = document.createElement("div");
  createElement.classList.add("header__item");
  createElement.innerHTML = `          

  <div class="header__card">
  <input name="name" type="text" placeholder="Название" />
</div>
<div class="header__card">
  <input name="count" type="number" placeholder="Количество" />
</div>
<div class="header__card">
  <input name="price" type="number" placeholder="Ценна" />
</div>
<div class="header__card">
  <input name="sum" type="number" placeholder="Сумма" />
</div>
  `;
  chooseHeaderList.appendChild(createElement);
});
// Отпарвка данных на сервер

// Получаем элементы формы и кнопки
const form = document.getElementById("submit-form");
const dealIdInput = document.querySelector(".header__deal-id input");

// Функция для проверки наличия сделки в Битрикс24
async function checkDealExists(dealId) {
  try {
    const response = await fetch(`${DEAL_GET_URL}?ID=${dealId}`);
    const data = await response.json();
    return data.result !== undefined;
  } catch (error) {
    console.error("Ошибка проверки сделки:", error);
    return false;
  }
}

const totalSum = 0;
// Функция для пересчета суммы
function calculateSum(inputElement) {
  const row = inputElement.closest(".header__item");
  const countInput = row.querySelector("input[name='count']");
  const priceInput = row.querySelector("input[name='price']");
  const sumInput = row.querySelector("input[name='sum']");
  if (countInput && priceInput && sumInput) {
    const count = parseFloat(countInput.value) || 0;
    const price = parseFloat(priceInput.value) || 0;
    sumInput.value = count * price;
    sumInput.setAttribute("readonly", true); // Делаем поле суммы неизменяемым
  }

}

// Назначаем обработчики событий для динамических полей
document.addEventListener("input", (event) => {
  if (event.target.name === "count" || event.target.name === "price") {
    calculateSum(event.target);
  }
});

// Обработчик отправки формы
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const dealId = dealIdInput.value.trim();
  if (!dealId) {
    alert("Введите ID сделки!");
    return;
  }

  const dealExists = await checkDealExists(dealId);
  if (!dealExists) {
    alert("Сделка с таким ID не найдена в Битрикс24.");
    return;
  }

  // Сбор данных из формы
  const dealData = {
    ID: Number(dealId),
    rows: [],
  };
  document.querySelectorAll(".header__item").forEach((row) => {
    const nameInput = row.querySelector("input[name='name']");
    const countInput = row.querySelector("input[name='count']");
    const priceInput = row.querySelector("input[name='price']");
    const sumInput = row.querySelector("input[name='sum']");

    if (nameInput && countInput && priceInput && sumInput) {
      dealData.rows.push({
        PRODUCT_NAME: nameInput.value.trim(),
        QUANTITY: parseFloat(countInput.value) || 0,
        PRICE: parseFloat(priceInput.value) || 0,
      });
    }
  });
  console.log(dealData);

  // Отправка данных в Битрикс24
  try {
    const response = await fetch(FIELDS_UPDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dealData),
    });
    const result = await response.json();
    console.log("Результат обновления сделки:", result);
    alert("Данные успешно отправлены!");
  } catch (error) {
    console.error("Ошибка при отправке данных:", error);
    alert("Произошла ошибка при отправке данных.");
  }
});
