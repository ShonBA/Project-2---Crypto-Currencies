// <reference path ="code.jquery.com_jquery-3.7.0.js"/> 

// JQuery - document ready
$(() => {

    // all usage variables and element
    const SelectedCoins = [];
    const CoinsDataArr = [];
    let SelectedCoin
    const currencies_KEY = "CURRENCIES_KEY"
    const currencies_data_KEY = "CURRENCIES_DATA_KEY"
    const mainContent = document.getElementById("mainContent");
    const currenciesLink = document.getElementById("currenciesLink");
    const cryptoLogo = document.getElementById("cryptoLogo");
    const liveReportsLink = document.getElementById("liveReportsLink");
    const aboutMeLink = document.getElementById("aboutMeLink");
    const cardModalContainer = document.getElementById("cardModalContainer");
    const searchTextBox = document.getElementById("searchTextBox");
    const closeModal = document.getElementById("closeModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const saveChangesModal = document.getElementById("saveChangesModal");
    const checkBoxArr = document.getElementsByClassName("checkBox");
    const checkBoxModal = document.getElementsByClassName("checkBoxModal");
    const exampleModal = new bootstrap.Modal("#staticBackdrop");


    // Starting Function Invoke
    getAndDisplayCurrencies();
    saveCurrenciesToSessionStorage();


    // =====================================================//
    //                                                      //
    //                   Event listeners                    //
    //                                                      //
    // =====================================================//

    // On click event listener
    currenciesLink.addEventListener("click", () => {
        const currencies = loadCurrenciesToSessionStorage();
        displayCurrencies(currencies);
        checkToggleOn()
    });

    // On click event listener
    cryptoLogo.addEventListener("click", () => {
        const currencies = loadCurrenciesToSessionStorage();
        displayCurrencies(currencies);
        checkToggleOn()
    });

    // Search bar function
    searchTextBox.addEventListener("keyup", async () => {
        const arr = await loadCurrenciesToSessionStorage();
        const search = searchTextBox.value;
        const searchArr = arr.filter(item => item.name.toLowerCase().indexOf(search) > -1 || item.symbol.indexOf(search) > -1);
        if (searchArr.length === 0) {
            mainContent.innerHTML = "Coin not found";
        } else if (search) {
            displayCurrencies(searchArr);
        } else {
            displayCurrencies(arr);
        }
    })

    // More info event listener
    $("div").on("click", ".moreInfoBtnBox", async function () {
        event.stopPropagation();
        if (this.getAttribute("aria-expanded") === "true") {
            const coinSessionData = await loadCoinDataFromSessionStorage();
            if (!coinSessionData) {
                showSpinner(); // Show the spinner before fetching data
                const json = await getCurrenciesInfo(this.id);
                const coinData = makeMoreInfoDateArr(json);
                CoinsDataArr.push(coinData);
                saveCoinDataToSessionStorage(CoinsDataArr);
                hideSpinner(); // Hide the spinner after data is loaded
                displayMoreInfo(coinData);
            } else {
                let foundMatchingCoin = false;
                for (let i = 0; i < coinSessionData.length; i++) {
                    if (coinSessionData[i].id === this.id) {
                        if (Date.now() - coinSessionData[i].time <= 10000) {
                            displayMoreInfo(coinSessionData[i]);
                            foundMatchingCoin = true;
                            break;
                        } else {
                            showSpinner(); // Show the spinner before fetching data
                            const json = await getCurrenciesInfo(this.id);
                            const coinData = makeMoreInfoDateArr(json);
                            CoinsDataArr.push(coinData);
                            coinSessionData[i] = coinData;
                            saveCoinDataToSessionStorage(coinSessionData);
                            hideSpinner(); // Hide the spinner after data is loaded
                            displayMoreInfo(coinData);
                            foundMatchingCoin = true;
                            break;
                        }
                    }
                }
                if (!foundMatchingCoin) {
                    showSpinner(); // Show the spinner before fetching data
                    const json = await getCurrenciesInfo(this.id);
                    const coinData = makeMoreInfoDateArr(json);
                    CoinsDataArr.push(coinData);
                    coinSessionData.push(coinData);
                    saveCoinDataToSessionStorage(coinSessionData);
                    hideSpinner(); // Hide the spinner after data is loaded
                    displayMoreInfo(coinData);
                }
            }
        }
    });

    // live reports page
    liveReportsLink.addEventListener("click", displayLiveReports);

    // about me page
    aboutMeLink.addEventListener("click", displayAboutMe);


    // =====================================================//
    //                                                      //
    //                   Display Function                   //
    //                                                      //
    // =====================================================//

    // making the json a object and return the object
    function makeMoreInfoDateArr(coinJson) {
        const coinInfo = {
            id: coinJson.id,
            usd: coinJson.market_data.current_price.usd,
            eur: coinJson.market_data.current_price.eur,
            ils: coinJson.market_data.current_price.ils,
            time: Date.now()
        }
        return coinInfo
    }

    // Display Currencies value
    function displayMoreInfo(coinInfo) {
        $(`#collapseExample${coinInfo.id}`).html(`<b>
        <br>
        USD: ${coinInfo.usd}$
        <br>
        ERU: ${coinInfo.eur}€
        <br>
        NIS: ${coinInfo.ils}₪
        </b>
        `)
    }

    // Function to show the spinner
    function showSpinner() {
        $(".spinner").addClass("show");
    }

    // Function to hide the spinner
    function hideSpinner() {
        $(".spinner").removeClass("show");
    }

    // Display about me page
    function displayAboutMe() {
        mainContent.innerHTML = `
        <div class="card mb-3" >
        <div class="row g-0">
          <div class="col-md-4">
            <img src="assets/images/About-Me.jpg" class="img-fluid rounded-start" alt="shon_pic">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h3 class="card-title">Hello! <br> Welcome to my Crypto Currencies Website</h3>
              <h6 class="card-text">
              My Name is Shon Benayoun, 25 Years old, From israel.
              <br>I am a Fullstack Web Development student at John Bryce College.
              <br>In this project we had to build a website for Crypto Currencies
              <br>The website provides information about Crypto Currencies. You can search for specific currencies, view their value in USD, ERU, INS.
              <br> The Site is using API to provide all the necessary data.
              <br> also you can select 5 currencies to see live reports about them, we also provide a modal that's popping when you choose more then 5 currencies. 
              <br>All the data save to the session storage and display from the storage to not spam the API.
              </h6>
              <p class="card-text"><small class="text-body-secondary">Really hope you enjoy you time in the site :D</small></p>
            </div>
          </div>
        </div>
      </div>`;
    }

    // get the currencies From API and display
    async function getAndDisplayCurrencies() {
        const currencies = await getCurrencies();
        displayCurrencies(currencies);
    }

    // accepting currencies array an injecting into HTML
    function displayCurrencies(currencies) {
        let html = ``;
        for (const coin of currencies) {
            html += `  
            <div id="${coin.id}" class="cardBox card d-inline-grid text-center" style="width: 18rem;" >
            <div class="card-body col">
                <label class="switch float-end">
                    <input type="checkbox" class="checkBox" id="${coin.id}">
                    <span class="slider round"></span>
                </label>
                <img src="${coin.image}" class="currencyLogoCard" height="40" width="40" alt="${coin.id}">
                <h5 class="card-title lh-lg mt-1" >${coin.name}</h5>
                <h6 class="card-subtitle mb-2 text-body-secondary lh-lg mt-1">${coin.symbol}</h6>
                <button id="${coin.id}" class="btn btn-primary moreInfoBtnBox" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapseExample${coin.id}" aria-expanded="false"
                    aria-controls="collapseExample" >
                    More info
                </button>
                <div class="collapseContainer" >
                    <div class="collapse" id="collapseExample${coin.id}">
                    <div class="collapseData card card-body border-0">
                    <div class="spinner"></div>

                        </div>
                    </div>
                </div>
        
            </div>
        </div>`
            mainContent.innerHTML = html;
        }

        // Checking for selected coins and modal display
        for (const check of checkBoxArr) {
            check.addEventListener("click", function () {
                if (check.checked === true) {
                    SelectedCoin = check.id;
                    SelectedCoins.push(SelectedCoin);
                    check.checked;
                }
                if (check.checked === false) {
                    const unCheckIndex = SelectedCoins.findIndex(item => item === check.id);
                    SelectedCoins.splice(unCheckIndex, 1);
                }
                if (SelectedCoins.length > 5) {
                    exampleModal.show()
                    let html = `<p>You can only Select 5 Currencies, Please choose one to Add ${check.id}, Or cancel</p>`
                    for (let i = 0; i < SelectedCoins.length - 1; i++) {
                        html += `
                        <div class="card" id="${SelectedCoins[i]}" style="width: 18rem;">
                        <div class="card-body">
                          <h5 class="card-title">${SelectedCoins[i]}</h5>
                          <label class="switch float-end">
                          <input type="checkbox" checked class="checkBoxModal" id="${SelectedCoins[i]}Modal">
                          <span class="slider round"></span>
                      </label>                        </div>
                      </div>
                        `
                    }
                    cardModalContainer.innerHTML = html;
                }
            })
        }

        // Close modal button, canceling the 6 coin and un toggle at main
        closeModal.addEventListener("click", function () {
            const removeId = SelectedCoins[5];
            for (const check of checkBoxArr) {
                if (check.id == removeId) {
                    check.checked = false
                }
            }
            SelectedCoins.pop()
        })

        // Close modal button, canceling the 6 coin and un toggle at main
        closeModalBtn.addEventListener("click", function () {
            const removeId = SelectedCoins[5];
            for (const check of checkBoxArr) {
                if (check.id == removeId) {
                    check.checked = false
                }
            }
            SelectedCoins.pop()
        })

        // check for disabled coins and splice them from array
        saveChangesModal.addEventListener("click", function () {
            let removeCoinId = '';
            for (const checkModal of checkBoxModal) {
                if (checkModal.checked === false) {
                    removeCoinId = checkModal.id;
                    removeCoinId = removeCoinId.slice(0, removeCoinId.length - 5);
                    const removeIndexChange = SelectedCoins.findIndex(item => item === removeCoinId);
                    SelectedCoins.splice(removeIndexChange, 1);
                    exampleModal.hide();
                }
            }
            for (const check of checkBoxArr) {
                if (check.id == removeCoinId) {
                    check.checked = false;
                    exampleModal.hide();
                }
            }
        })
    }

    // toggle on the selected coin when moving to different "pages"
    function checkToggleOn() {
        if (SelectedCoins.length > 0) {
            for (const coin of SelectedCoins) {
                for (const check of checkBoxArr) {
                    if (coin == check.id) {
                        check.checked = true;
                    } 
                }
            }
        }
    }

    // =====================================================//
    //                                                      //
    //                  Session Storage                     //
    //                                                      //
    // =====================================================//


    // save currencies data to session storage
    async function saveCoinDataToSessionStorage(coinData) {
        const json = JSON.stringify(coinData);
        sessionStorage.setItem(currencies_data_KEY, json);
    }

    // load currencies data from storage return parse
    function loadCoinDataFromSessionStorage() {
        const json = sessionStorage.getItem(currencies_data_KEY);
        const coinData = JSON.parse(json);
        return coinData;
    }

    // save currencies as json string to  session storage
    async function saveCurrenciesToSessionStorage() {
        const currencies = await getCurrencies();
        const json = JSON.stringify(currencies);
        sessionStorage.setItem(currencies_KEY, json)
    }

    // load currencies from session storage return parse
    function loadCurrenciesToSessionStorage() {
        const json = sessionStorage.getItem(currencies_KEY);
        const currencies = JSON.parse(json);
        return currencies;
    }

    // =====================================================//
    //                                                      //
    //                        AJAX                          //
    //                                                      //
    // =====================================================//

    // AJAX - get currencies from API
    async function getCurrencies() {
        const response = await fetch('crypto.json');
        const json = await response.json();
        return json
    }

    // AJAX - get currencies data from API
    async function getCurrenciesInfo(currency) {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${currency}`);
        const json = await response.json();
        return json;
    }



















    function displayLiveReports() {
        mainContent.innerHTML = `<h1>Live Reports...</h1>`;
    }


});