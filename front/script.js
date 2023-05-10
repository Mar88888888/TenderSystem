const btnFormLogin = Array.from(document.querySelectorAll(".login-btn"));
const btnLogOut = document.querySelector("#log-out");
const btnGoCreateTender = document.querySelector("#create-tender");
const btnLogin = document.querySelector("#submit__login");
const btnOpenSearch = document.querySelector("#open-search-btn");
const btnSearch = document.querySelector("#search-button");
const btnGoCreateBid = Array.from(document.querySelectorAll(".bid-create"));
const btnMyTenders = document.querySelector("#my-tenders");
const btnRegister = document.querySelector("#register");
const btnDelTender = document.querySelectorAll(".delete-tender");
const btnDelTenderYes = document.querySelector("#conf-del-yes");
const btnDelTenderNo = document.querySelector("#conf-del-cancel");
const btnAcceptBidYes = document.querySelector("#conf-acc-yes");
const btnAcceptBidNo = document.querySelector("#conf-acc-cancel");
const btnCreateTender = document.querySelector("#create-tender-btn");
const btnOk = document.querySelector("#ok");
const btnCreateBid = document.querySelector("#create-bid-btn");
const btnReg = document.querySelector("#submit__reg");

const formLogin = document.querySelector("#login-form");
const formRegister = document.querySelector("#register-form");
const formConfirmDel = document.querySelector("#delete-confirm");
const formConfirmAccept = document.querySelector("#accept-confirm");

const formCreateTender = document.querySelector("#tender-create");
const formCreateBid = document.querySelector("#bid-create");

const inputLogin = document.querySelector("#username");
const inputPassword = document.querySelector("#password");

const inputRegName = document.querySelector("#reg-name");
const inputRegUsername = document.querySelector("#reg-username");
const inputRegPassword = document.querySelector("#reg-password");
const inputRegPasswordRepeat = document.querySelector("#repeat-password");
const inputSearchBox = document.querySelector(".search-box");

const inputCreateTitle = document.querySelector("#title");
const inputCreateExpPrice = document.querySelector("#exp-price");
const inputCreateDescription = document.getElementById("description");
const inputCreateKeywords = document.querySelector("#keywords");
const inputCreateCompany = document.querySelector("#company");

const overlay = document.querySelector(".overlay");
const msg = document.querySelector("#create-tender-success");
const search = Array.from(document.querySelectorAll(".search"));

const barNav = document.querySelector("nav");
const listMenu = document.querySelector(".menu");
const fieldTenderSearch = document.querySelector("#tender-search");
const fieldTenderBids = document.querySelector("#tender-bids");
const forms = Array.from(document.querySelectorAll(".form"));

//
let allEls = Array.from(document.querySelector("main").children);

//
//

let deleteId;
let loggedIn = false;
let currentUserId;
function checkLog() {
  fetch("/logged")
    .then((response) => response.json())
    .then((data) => {
      loggedIn = data.logged;
      currentUserId = data.currentUserId;
      console.log(`Logged in:${data.logged}`);
    })
    .catch((error) => console.error(error));
}
checkLog();

//
//
//
/// Functions
const closeAll = function () {
  allEls.forEach(function (el) {
    el.classList.add("hidden");
  });
  forms.forEach(function (el) {
    el.classList.add("hidden");
  });
};

const openForm = function (form) {
  if (!loggedIn) {
    form.classList.remove("hidden");
    overlay.classList.remove("hidden");
  } else {
    listMenu.classList.toggle("hidden");
  }
};

function showMessage(text, btnText = "Чудово!") {
  msg.querySelector("h2").textContent = `${text}`;
  msg.querySelector("button").textContent = `${btnText}`;
  msg.classList.remove("hidden");
  overlay.classList.remove("hidden");
}
//
//
//Event listeners

btnFormLogin.forEach(function (btn) {
  btn.addEventListener("click", function () {
    formRegister.classList.add("hidden");
    openForm(formLogin);
  });
});

overlay.addEventListener("click", function () {
  formConfirmAccept.classList.add("hidden");
  formConfirmDel.classList.add("hidden");
  formLogin.classList.add("hidden");
  formRegister.classList.add("hidden");
  msg.classList.add("hidden");
  overlay.classList.add("hidden");
});

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  const login = inputLogin.value;
  const password = inputPassword.value;

  fetch("/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      log: "in",
      login: login,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.response) {
        loggedIn = true;
        console.log(data);
        console.log(`Id: ${data.currentUserId}`);
        currentUserId = data.currentUserId;
        overlay.classList.toggle("hidden");
        formLogin.classList.toggle("hidden");
      } else if (data.cause === "notFound") {
        alert("Неправильний логін або пароль!");
      } else alert("Щось пішло не так...\nСпробуйте знову");
    });

  inputLogin.value = inputPassword.value = "";
  inputPassword.blur();
});

btnRegister.addEventListener("click", openForm.bind(null, formRegister));

btnOpenSearch.addEventListener("click", function (e) {
  e.preventDefault();

  barNav.classList.toggle("search-active");

  search.forEach(function (el) {
    el.classList.toggle("hidden");
  });
});

fieldTenderSearch.addEventListener("click", function (e) {
  e.preventDefault();
  if (loggedIn === true) {
    if (e.target.classList.contains("create-bid")) {
      if (e.target.parentElement.getAttribute("ownerId") === currentUserId) {
        showMessage(
          "Ви не можете створити пропозицію по своєму тендеру",
          "Добре"
        );
      } else {
        let title =
          e.target.parentElement.querySelector(".tender-title").textContent +
          `     ` +
          e.target.parentElement.querySelector(".tender-price").textContent;
        let tenderId = e.target.parentElement.getAttribute("tenderId");

        closeAll();
        formCreateBid.classList.remove("hidden");
        formCreateBid.setAttribute("tenderId", tenderId);
        formCreateBid.querySelector("h2").textContent = title;
      }
    } else if (e.target.classList.contains("delete-tender")) {
      formConfirmDel.classList.remove("hidden");
      overlay.classList.remove("hidden");

      deleteId = e.target.parentElement.getAttribute("tenderId");
    } else if (e.target.classList.contains("show-bids")) {
      let tenderId = e.target.parentElement.getAttribute("tenderId");
      fetch("/showBids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenderId: tenderId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          let bids = data.bids;
          let tender = data.tender;

          closeAll();
          fieldTenderBids.classList.remove("hidden");
          fieldTenderBids.innerHTML = `<label id="search-result-label">Пропозиції по тендеру ${tender.title}:</label>`;

          console.log(`Found bids:${bids}`);
          if (bids.length === 0) {
            const notFoundHtml = `<h2 class="no-results">Схоже по цьому тендеру ще не було пропозицій </h2>`;
            fieldTenderBids.insertAdjacentHTML("beforeend", notFoundHtml);
          } else {
            bids.forEach(function (bid) {
              let html = `<div class="tender" bidId = "${bid._id}" bid-owner = "${bid.ownerCompany}">
                            <h2 class="bid-owner">${bid.ownerCompany}</h2>
                            <strong>Запропонована вартість:</strong>
                            <h1 class="bid-price">${bid.price} грн</h2>
                            <div class = "container">
                            <p class="bid-description">${bid.description}</p>
                            </div>
                            <button class="btn-bid accept-bid">Прийняти пропозицію</button>
                          </div>`;
              fieldTenderBids.insertAdjacentHTML("beforeend", html);
            });
          }
        });
    } else if (e.target.classList.contains("toggle-active")) {
      let tenderId = e.target.parentElement.getAttribute("tenderId");
      overlay.classList.remove("hidden");

      fetch("/toggleActive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenderId: tenderId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.response) {
            const active = data.tender.active;
            showMessage(
              `Тедер було ${active ? "запущено" : "призупинено"}`,
              "OК"
            );
            e.target.textContent = `${active ? "Призупинити" : "Запустити"}`;
          } else showMessage("Виникла помилка, спробуйте ще", "ОК");
        });
    } else if (e.target.classList.contains("generate-url")) {
      e.target.parentElement.querySelector(
        ".url-container"
      ).textContent = `http://localhost:3000/tender/${e.target.parentElement.getAttribute(
        "tenderid"
      )}`;
    }
  } else if (loggedIn === false && e.target.classList.contains("btn-bid")) {
    openForm(formLogin);
  }
});

btnLogOut.addEventListener("click", function () {
  loggedIn = false;
  currentUserId = "";
  fetch("/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      log: "out",
    }),
  });
  inputSearchBox.value = "";
  closeAll();
  listMenu.classList.add("hidden");
});

btnGoCreateTender.addEventListener("click", function () {
  closeAll();
  formCreateTender.classList.remove("hidden");
  listMenu.classList.add("hidden");
});

btnSearch.addEventListener("click", function () {
  listMenu.classList.add("hidden");
  closeAll();
  fieldTenderSearch.classList.remove("hidden");
  fieldTenderSearch.innerHTML = `<label id="search-result-label">Результати пошуку:</label>`;

  let foundTenders;
  fetch("/findTenders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keywords: inputSearchBox.value.toLowerCase().split(" "),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      foundTenders = data.foundTenders;
      console.log(`Found tenders:${foundTenders}`);
      if (foundTenders.length === 0) {
        const notFoundHtml = `<h2 class="no-results">Схоже за таким запитом не знайдено тендерів, спробуйте змінити запит.</h2>`;
        fieldTenderSearch.insertAdjacentHTML("beforeend", notFoundHtml);
      } else {
        foundTenders.forEach(function (tender) {
          if (!tender.acceptedBid) {
            let html = `<div class="tender" tenderId = "${tender._id}" ownerId = "${tender.ownerId}">
                          <h2 class="tender-title">${tender.title}</h2>
                          <strong>Очікувана вартість:</strong>
                          <h1 class="tender-price">${tender.expPrice} грн</h2>
                          
                          <div class = "container">
                          <p class="tender-description">${tender.description}</p>
                          </div>
                          <ul class="tender-details">
                            <li><strong>Хазяїн тендеру:</strong>${tender.ownerCompany}</li>
                          </ul>
                          <button class="btn-bid create-bid">Створити пропозицію</button>
                        </div>`;

            fieldTenderSearch.insertAdjacentHTML("beforeend", html);
          } else {
            //
            //
            //Accepted bid tender
            let htmlAccepted = `<div class="tender" tenderId = "${tender._id}" ownerId = "${tender.ownerId}">
                            <h2 class="tender-title">${tender.title}</h2>
                            <strong>Очікувана вартість:</strong>
                            <h1 class="tender-price">${tender.expPrice} грн</h2>
                            
                            <div class = "container">
                            <p class="tender-description">${tender.description}</p>
                            </div>
                            <ul class="tender-details">
                              <li><strong>Хазяїн тендеру:</strong>${tender.ownerCompany}</li>
                            </ul>
                            <br>
                            <center><strong>Пропозицію прийнято:</strong></center>
                              <div class="tender" bidId = "${tender.acceptedBid._id}">
                              <strong>Автор пропозиції:</strong>          
                              <h2 class="bid-owner">${tender.acceptedBid.ownerCompany}</h2>
                              <strong>Запропонована вартість:</strong>
                              <h1 class="bid-price">${tender.acceptedBid.price} грн</h2>
                              <strong>Опис пропозиції:</strong>
                              <p class="bid-description">${tender.acceptedBid.description}</p>
                              </div>
                          </div>`;

            fieldTenderSearch.insertAdjacentHTML("beforeend", htmlAccepted);
          }
        });
      }
    })
    .catch((error) => console.error(error));
});

btnMyTenders.addEventListener("click", function () {
  listMenu.classList.add("hidden");
  closeAll();
  fieldTenderSearch.classList.remove("hidden");
  fieldTenderSearch.innerHTML = `<label id="search-result-label">Мої тендери:</label>`;

  let myTenders;
  fetch("/myTenders")
    .then((response) => response.json())
    .then((data) => {
      myTenders = data.myTenders;
      console.log(`My tenders:${myTenders}`);
      if (myTenders.length === 0) {
        const notFoundHtml = `<h2 class="no-results">Схоже у вас ще немає власних тендерів</h2>`;
        fieldTenderSearch.insertAdjacentHTML("beforeend", notFoundHtml);
      } else {
        myTenders.forEach(function (tender) {
          if (!tender.acceptedBid) {
            console.log(`notaccepted`);
            let html = `<div class="tender" tenderId = "${
              tender._id
            }" ownerId = "${tender.ownerId}">
                      <h2 class="tender-title">${tender.title}</h2>
                      <strong>Очікувана вартість:</strong>
                      <h1 class="tender-price">${tender.expPrice} грн</h2>
                      
                      <div class = "container">
                      <p class="tender-description">${tender.description}</p>
                      </div>
                      <ul class="tender-details">
                        <li><strong>Хазяїн тендеру:</strong>${
                          tender.ownerCompany
                        }</li>
                      </ul>
                      <br>
                      <button class="btn-bid generate-url">Згенерувати посилання</button>
                      <button class="btn-bid show-bids">Переглянути пропозиції</button>
                      <button class="btn-bid toggle-active">${
                        tender.active ? "Призупинити" : "Запустити"
                      }</button>
                      <button class="btn-bid delete-tender">Видалити тендер</button>
                      <br>
                      <div class = "tender url-container"></div>
                    </div>`;

            fieldTenderSearch.insertAdjacentHTML("beforeend", html);
          } else {
            //
            //
            //Accepted bid tender
            let htmlAccepted = `<div class="tender" tenderId = "${
              tender._id
            }" ownerId = "${tender.ownerId}">
                            <h2 class="tender-title">${tender.title}</h2>
                            <strong>Очікувана вартість:</strong>
                            <h1 class="tender-price">${tender.expPrice} грн</h2>
                            
                            <div class = "container">
                            <p class="tender-description">${
                              tender.description
                            }</p>
                            </div>
                            <ul class="tender-details">
                              <li><strong>Хазяїн тендеру:</strong>${
                                tender.ownerCompany
                              }</li>
                            </ul>
                            <strong>Пропозицію прийнято:</strong>
                              <div class="tender" bidId = "${
                                tender.acceptedBid._id
                              }">
                              <strong>Автор пропозиції:</strong>          
                              <h2 class="bid-owner">${
                                tender.acceptedBid.ownerCompany
                              }</h2>
                              <strong>Запропонована вартість:</strong>
                              <h1 class="bid-price">${
                                tender.acceptedBid.price
                              } грн</h2>
                              <p class="bid-description">${
                                tender.acceptedBid.description
                              }</p>
                              </div>
                              <br>
                              <button class="btn-bid generate-url">Згенерувати посилання</button>
                              <button class="btn-bid toggle-active">${
                                tender.active ? "Призупинити" : "Запустити"
                              }</button>
                              <button class="btn-bid delete-tender">Видалити тендер</button>
                              <br>
                              <div class = "tender url-container"></div>

                          </div>`;

            fieldTenderSearch.insertAdjacentHTML("beforeend", htmlAccepted);
          }
        });
      }
    })
    .catch((error) => console.error(error));
});

btnDelTenderNo.addEventListener("click", function (e) {
  e.preventDefault();
  overlay.classList.add("hidden");
  formConfirmDel.classList.add("hidden");
});

btnDelTenderYes.addEventListener("click", function (e) {
  e.preventDefault();
  formConfirmDel.classList.add("hidden");
  console.log(deleteId);
  fetch("/deleteTender", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tenderId: deleteId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.response) {
        showMessage("Тендер було видалено", "OК");
        const delTender = document.querySelector(`[tenderId="${deleteId}"]`);
        delTender.remove();
      } else showMessage("Виникла помилка, спробуйте ще", "ОК");
    })
    .catch((error) => console.error(error));
});

btnCreateTender.addEventListener("click", function (e) {
  e.preventDefault();
  let tender = {
    title: inputCreateTitle.value, //
    description: inputCreateDescription.value,
    expPrice: inputCreateExpPrice.value,
    ownerCompany: inputCreateCompany.value,
    keywords: inputCreateKeywords.value
      .split(" ")
      .concat(inputCreateTitle.value.split(" "))
      .concat(inputCreateDescription.value.split(" "))
      .concat(inputCreateCompany.value.split(" "))
      .concat(["", " "])
      .map((word) => word.toLowerCase()),
  };

  if (inputCreateTitle.value.length < 3) {
    alert("Занадто короткий заголовок!");
  } else if (inputCreateDescription.value.length < 3) {
    alert("Занадто короткий опис!");
  } else if (inputCreateExpPrice.value.toString().length < 1) {
    alert("Введіть очікувану вартість!");
  } else {
    fetch("/newTender", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tender),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.response) {
          inputCreateTitle.value =
            inputCreateCompany.value =
            inputCreateDescription.value =
            inputCreateExpPrice.value =
            inputCreateKeywords.value =
              "";
          closeAll();
          showMessage("Тендер успішно створено!");
        } else showMessage("Щось пішло не так...\nСпробуйте знову", "OK");
      });
  }
});
//
btnOk.addEventListener("click", function (e) {
  e.preventDefault();
  msg.classList.add("hidden");
  overlay.classList.add("hidden");
});

btnCreateBid.addEventListener("click", function (e) {
  e.preventDefault();
  let form = e.target.parentElement.parentElement;
  let tenderId = form.getAttribute("tenderId");
  const ownerCompany = form.querySelector("#bid-owner").value;
  const price = form.querySelector("#bid-price").value;
  const description = form.querySelector("#bid-description").value;
  let bid = {
    tenderId: tenderId,
    ownerCompany: ownerCompany,
    price: price,
    description: description,
  };

  if (ownerCompany.length < 2) {
    alert("Введіть назву компанії!");
  } else if (description.length < 3) {
    alert("Занадто короткий опис!");
  } else if (price.toString().length < 1) {
    alert("Введіть запропоновану вартість!");
  } else {
    fetch("/newbid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bid),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.response) {
          form.querySelector("#bid-owner").value =
            form.querySelector("#bid-price").value =
            form.querySelector("#bid-description").value =
              "";
          closeAll();
          showMessage("Пропозицію успішно створено!");
        } else showMessage("Щось пішло не так...\nСпробуйте знову", "OK");
      });
  }
});

fieldTenderBids.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.classList.contains("accept-bid")) {
    let bidId = e.target.parentElement.getAttribute("bidId");
    let bidOwner = e.target.parentElement.getAttribute("bid-owner");
    formConfirmAccept.querySelector(
      "h2"
    ).textContent = `Бажаєте прийняти пропозицію від ${bidOwner}?`;
    formConfirmAccept.classList.remove("hidden");
    formConfirmAccept.setAttribute("bidId", bidId);
    overlay.classList.remove("hidden");
  }
});

btnAcceptBidNo.addEventListener("click", function (e) {
  e.preventDefault();
  formConfirmAccept.classList.add("hidden");
  overlay.classList.add("hidden");
});

btnAcceptBidYes.addEventListener("click", function (e) {
  e.preventDefault();
  let bidId = e.target.parentElement.getAttribute("bidId");
  fetch("/acceptBid", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: bidId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.response) {
        inputCreateTitle.value =
          inputCreateCompany.value =
          inputCreateDescription.value =
          inputCreateExpPrice.value =
          inputCreateKeywords.value =
            "";
        closeAll();
        showMessage("Пропозицію прийнято!");
      } else {
        formConfirmAccept.classList.add("hidden");
        showMessage("Щось пішло не так...\nСпробуйте знову", "OK");
      }
    });
});

btnReg.addEventListener("click", function (e) {
  e.preventDefault();

  if (inputRegName.value.length < 3) {
    alert("Занадто коротке ім'я!");
  } else if (inputRegUsername.value.length < 3) {
    alert("Занадто короткий логін!");
  } else if (inputRegPassword.value.length < 3) {
    alert("Занадто короткий пароль!");
  } else if (inputRegPasswordRepeat.value === inputRegPassword.value) {
    fetch("/reg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: inputRegName.value,
        username: inputRegUsername.value,
        password: inputRegPassword.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.response) {
          loggedIn = true;
          inputRegName.value =
            inputRegPassword.value =
            inputRegUsername.value =
            inputRegPasswordRepeat.value =
              "";
          closeAll();
          showMessage("Акаунт успішно створено!");
        } else if (data.cause === "exists") {
          alert("Логін вже зайнято! Спробуйте інший");
        } else showMessage("Щось пішло не так...\nСпробуйте знову", "OK");
      });
  } else {
    alert("Паролі не сходяться!");
  }
});
