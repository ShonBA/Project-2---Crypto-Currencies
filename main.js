// <reference path ="code.jquery.com_jquery-3.7.0.js"/> 

// JQuery - document ready
$(() => {


    // =====================================================//
    //                                                      //
    //              Variables and elements                  //
    //                                                      //
    // =====================================================//

    const selectedCoins = [];
    const coinsDataArr = [];
    let SelectedCoin = {};
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


    // =====================================================//
    //                                                      //
    //                  Starting Functions                  //
    //                                                      //
    // =====================================================//

    getAndDisplayCurrencies().catch((error) => {
        console.log("failed while fetching currencies in display currencies function :", error);
    });
    saveCurrenciesToSessionStorage().catch((error) => {
        console.log("Error while fetching to save currencies to session storage:", error);
    });



    // =====================================================//
    //                                                      //
    //                   Event listeners                    //
    //                                                      //
    // =====================================================//

    // On click event listener
    currenciesLink.addEventListener("click", () => {
        const currencies = loadCurrenciesFromSessionStorage();
        displayCurrencies(currencies);
        checkToggleOn()
        stopDataUpdates()
    });

    // On click event listener
    cryptoLogo.addEventListener("click", () => {
        const currencies = loadCurrenciesFromSessionStorage();
        displayCurrencies(currencies);
        checkToggleOn()
        stopDataUpdates()

    });

    // live reports page
    liveReportsLink.addEventListener("click", () => {
        if (selectedCoins.length === 0) {
            mainContent.innerHTML = `<h1>Please Select 1 - 5 Currencies</h1>`
        } else {
            displayLiveReports()
        }
    });

    // about me page
    aboutMeLink.addEventListener("click", () => {
        displayAboutMe()
        stopDataUpdates()

    });

    // Search bar function
    searchTextBox.addEventListener("input", () => {
        const arr = loadCurrenciesFromSessionStorage();
        const search = searchTextBox.value;
        const searchArr = arr.filter(item => item.name.indexOf(search) > -1 || item.name.toLowerCase().indexOf(search) > -1 || item.name.toUpperCase().indexOf(search) > -1 || item.symbol.indexOf(search) > -1 || item.symbol.toUpperCase().indexOf(search) > -1);
        if (searchArr.length === 0) {
            mainContent.innerHTML = `<h1>Coin not found...<h1>`;
        } else if (search) {
            displayCurrencies(searchArr);
        } else {
            displayCurrencies(arr);
        }
    })

    // More info event listener
    $("div").on("click", ".moreInfoBtnBox", function () {
        return new Promise(async (resolve, reject) => {
            try {
                event.stopPropagation();
                if (this.getAttribute("aria-expanded") === "true") {
                    const coinSessionData = await loadCoinDataFromSessionStorage();
                    if (!coinSessionData) {
                        showSpinner();
                        const json = await getCurrenciesInfo(this.id);
                        const coinData = makeMoreInfoDateArr(json);
                        coinsDataArr.push(coinData);
                        saveCoinDataToSessionStorage(coinsDataArr);
                        hideSpinner();
                        displayMoreInfo(coinData);
                    } else {
                        let foundMatchingCoin = false;
                        for (let i = 0; i < coinSessionData.length; i++) {
                            if (coinSessionData[i].id === this.id) {
                                if (Date.now() - coinSessionData[i].time <= 120000) {
                                    displayMoreInfo(coinSessionData[i]);
                                    foundMatchingCoin = true;
                                    break;
                                } else {
                                    showSpinner();
                                    const json = await getCurrenciesInfo(this.id);
                                    const coinData = makeMoreInfoDateArr(json);
                                    coinsDataArr.push(coinData);
                                    coinSessionData[i] = coinData;
                                    saveCoinDataToSessionStorage(coinSessionData);
                                    hideSpinner();
                                    displayMoreInfo(coinData);
                                    foundMatchingCoin = true;
                                    break;
                                }
                            }
                        }
                        if (!foundMatchingCoin) {
                            showSpinner();
                            const json = await getCurrenciesInfo(this.id);
                            const coinData = makeMoreInfoDateArr(json);
                            coinsDataArr.push(coinData);
                            coinSessionData.push(coinData);
                            saveCoinDataToSessionStorage(coinSessionData);
                            hideSpinner();
                            displayMoreInfo(coinData);
                        }
                    }
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        }).catch((error) => {
            console.log("Error while fetching more coin info", error);
        });
    });



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

    // get the currencies From API and display
    function getAndDisplayCurrencies() {
        return new Promise(async (resolve, reject) => {
            try {
                const currencies = await getCurrencies(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`);
                displayCurrencies(currencies);
                resolve(currencies);
            } catch (error) {
                reject(error);
            }
        });
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
                    selectedCoins.push(SelectedCoin);
                    check.checked;
                }
                if (check.checked === false) {
                    const unCheckIndex = selectedCoins.findIndex(item => item === check.id);
                    selectedCoins.splice(unCheckIndex, 1);
                }
                if (selectedCoins.length > 5) {
                    exampleModal.show()
                    let html = `<p>You can only Select 5 Currencies, Please choose one to Add ${check.id}, Or cancel</p>`
                    for (let i = 0; i < selectedCoins.length - 1; i++) {
                        html += `
                        <div class="card" id="${selectedCoins[i]}" style="width: 18rem;">
                        <div class="card-body">
                          <h5 class="card-title">${selectedCoins[i]}</h5>
                          <label class="switch float-end">
                          <input type="checkbox" checked class="checkBoxModal" id="${selectedCoins[i]}Modal">
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
            const removeId = selectedCoins[5];
            for (const check of checkBoxArr) {
                if (check.id == removeId) {
                    check.checked = false
                }
            }
            selectedCoins.pop()
        })

        // Close modal button, canceling the 6 coin and un toggle at main
        closeModalBtn.addEventListener("click", function () {
            const removeId = selectedCoins[5];
            for (const check of checkBoxArr) {
                if (check.id == removeId) {
                    check.checked = false
                }
            }
            selectedCoins.pop()
        })

        // check for disabled coin restricting one
        saveChangesModal.addEventListener("click", function () {
            let disabledInputCount = 0;
            let removeCoinId = '';

            // Count the number of disabled inputs
            for (const checkModal of checkBoxModal) {
                if (checkModal.checked === false) {
                    disabledInputCount++;
                    removeCoinId = checkModal.id.slice(0, -5);
                }
            }

            if (disabledInputCount !== 1) {
                return;
            }

            const removeIndexChange = selectedCoins.findIndex(item => item === removeCoinId);
            selectedCoins.splice(removeIndexChange, 1);

            for (const check of checkBoxArr) {
                if (check.id === removeCoinId) {
                    check.checked = false;
                }
            }
            exampleModal.hide();
        });
    }

    // toggle on the selected coin when moving to different "pages"
    function checkToggleOn() {
        if (selectedCoins.length > 0) {
            for (const coin of selectedCoins) {
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
    function saveCurrenciesToSessionStorage() {
        return new Promise(async (resolve, reject) => {
            try {
                const currencies = await getCurrencies(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`);
                const json = JSON.stringify(currencies);
                sessionStorage.setItem(currencies_KEY, json);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    // load currencies from session storage return parse
    function loadCurrenciesFromSessionStorage() {
        const json = sessionStorage.getItem(currencies_KEY);
        const currencies = JSON.parse(json);
        return currencies;
    }

    // =====================================================//
    //                                                      //
    //                        AJAX                          //
    //                                                      //
    // =====================================================//

    // get currencies from API
    async function getCurrencies(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`);
                const json = response.json();
                resolve(json);
            } catch (error) {
                reject(error);
            }
        }).catch((error) => {
            console.log("Error while fetching currencies from API:", error);
        });
    }

    // get currencies data from API
    function getCurrenciesInfo(currency) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${currency}`);
                const json = await response.json();
                resolve(json);
            } catch (error) {
                reject(error);
            }
        }).catch((error) => {
            console.log("Error while fetching currencies info from API:", error);
        });
    }

    function getCurrenciesLiveInfo(liveFetchString) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${liveFetchString}&tsyms=USD`);
                const json = await response.json();
                resolve(json);
            } catch (error) {
                reject(error);
            }
        }).catch((error) => {
            console.log("Error while fetching currencies info from API:", error);
        });
    }


    // =====================================================//
    //                                                      //
    //                Live Report Functions                 //
    //                                                      //
    // =====================================================//


    // Getting coins symbol to fetch 
    function getLiveReportsCurrenciesInfo(currencies) {
        const resultArray = [];
        for (const coin of selectedCoins) {
            const currencyInfo = currencies.find((currency) => currency.id === coin);
            if (currencyInfo) {
                resultArray.push(currencyInfo);
            }
        }

        return resultArray;
    }

    // Getting fetch string (btc,eth...)
    function getLiveFetchString(resultArray) {
        let liveFetchString = "";
        for (const coin of resultArray) {
            liveFetchString += coin.symbol + ",";
        }
        return liveFetchString
    }

    // making the fetch data iterable
    async function getIterableArrLive() {
        const currencies = loadCurrenciesFromSessionStorage();
        console.log(currencies)
        const reportsInfo = getLiveReportsCurrenciesInfo(currencies)
        console.log(reportsInfo)
        const liveStr = getLiveFetchString(reportsInfo);
        console.log(liveStr)
        const fetchLiveInfo = await getCurrenciesLiveInfo(liveStr);
        const liveDataArray = Object.keys(fetchLiveInfo).map(currency => ({
            currency,
            usd: fetchLiveInfo[currency].USD
        }));
        return liveDataArray
    }

    //declare option to make changes
    let options = {
        exportEnabled: true,
        animationEnabled: true,
        title: {
            text: "Selected Crypto's Live Reports",
        },
        axisX: {
            title: "Date",
        },
        axisY: {
            title: "Currencies Value USD",
            titleFontColor: "#4F81BC",
            lineColor: "#4F81BC",
            labelFontColor: "#4F81BC",
            tickColor: "#4F81BC",
        },
        toolTip: {
            shared: true,
        },
        legend: {
            cursor: "pointer",
        },
        data: [],
    };

    // updating data points
    function addDataPoints(liveDataArray) {
        const currentDate = new Date();
        for (const coin of liveDataArray) {
            const dataSeries = options.data.find((series) => series.name === `${coin.currency} Value`);
            if (dataSeries) {
                // Check if dataPoints array exists, if not create it
                if (!dataSeries.dataPoints) {
                    dataSeries.dataPoints = [];
                }
                dataSeries.dataPoints.push({ x: currentDate, y: coin.usd });
            } else {
                options.data.push({
                    type: "spline",
                    name: `${coin.currency} Value`,
                    showInLegend: true,
                    xValueFormatString: "MMM YYYY",
                    yValueFormatString: "#,##0 Units",
                    dataPoints: [{ x: currentDate, y: coin.usd }],
                });
            }
        }
    }

    // printing the live reports functions
    function liveReports(liveDataArray) {
        addDataPoints(liveDataArray);
        $("#mainContent").CanvasJSChart(options);
    }

    // fetching updated data and render on charts 
    let dataUpdateInterval;
    async function displayLiveReports() {
        const liveDataArray = await getIterableArrLive();
        console.log(liveDataArray);
        liveReports(liveDataArray);

        // Update the data points every 2 seconds
        dataUpdateInterval = setInterval(async () => {
            const updatedLiveDataArray = await getIterableArrLive();
            console.log(updatedLiveDataArray);
            addDataPoints(updatedLiveDataArray);
            $("#mainContent").CanvasJSChart().render();
        }, 2000);
    }

    // reset options to start new  
    function stopDataUpdates() {
        clearInterval(dataUpdateInterval);
        options = {
            exportEnabled: true,
            animationEnabled: true,
            title: {
                text: "Selected Crypto's Live Reports",
            },
            axisX: {
                title: "Date",
            },
            axisY: {
                title: "Currencies Value USD",
                titleFontColor: "#4F81BC",
                lineColor: "#4F81BC",
                labelFontColor: "#4F81BC",
                tickColor: "#4F81BC",
            },
            toolTip: {
                shared: true,
            },
            legend: {
                cursor: "pointer",
            },
            data: [],
        };
    }
});