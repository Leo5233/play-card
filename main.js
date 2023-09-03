const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png" // 梅花
];

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52)); //產生長度52亂序陣列給dislaycards
  },
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        if (model.isRevealedCardsMatched()) {
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          view.appendCorrectAnimation(...model.revealedCards);
          model.revealedCards = [];
          this.currentState = GAME_STATE.FirstCardAwaits;
          view.renderScore((model.score += 10));
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        view.renderTrytime((model.tryTime += 1));
        if (model.score === 260) {
          view.showCompleteMSG();
        }
    }
    console.log("current state: ", this.currentState);
  },
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits; //這裡不能用this, 因為是settimeout function在呼叫，源頭是browser
  }
};

const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    card1 = this.revealedCards[0].dataset.index;
    card2 = this.revealedCards[1].dataset.index;
    return card1 % 13 === card2 % 13;
  },
  score: 0,
  tryTime: 0
};

const view = {
  getCardPattern(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `<p>${number}</p>
    <img src="${symbol}">
    <p>${number}</p>`;
  },
  getCardElement(index) {
    //只有一開始發牌會用到，全部都背面
    return `    <div data-index=${index} class="one-card back"></div>`;
  },
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");

    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join(""); //產生52張牌(全背面無點數)
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardPattern(Number(card.dataset.index)); //背面翻正並從dataset給予點數花色
      } else {
        card.classList.add("back");
        card.innerHTML = null;
      }
    });
  },
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },
  renderScore(score) {
    const scoreBox = document.querySelector("#score");
    scoreBox.innerText = `Score: ${score}`;
  },
  renderTrytime(tryTime) {
    const tryTimeBox = document.querySelector("#tryTime");
    tryTimeBox.innerText = `You've tried: ${tryTime} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (event) => {
          card.classList.remove("wrong");
        },
        { once: true }
      );
    });
  },
  appendCorrectAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("correct");
    });
  },
  showCompleteMSG() {
    const scoreBox = document.querySelector("#score");
    const scoreEnd = document.querySelector("#score-complete");
    const tryTimeBox = document.querySelector("#tryTime");
    const tryTimeEnd = document.querySelector("#trytime-complete");
    const endBanner = document.querySelector(".finished");
    scoreEnd.innerText = scoreBox.innerText;
    tryTimeEnd.innerText = tryTimeBox.innerText;
    endBanner.style.visibility = "";
  }
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index]
      ];
    }

    return number;
  }
};

controller.generateCards();

document.querySelectorAll(".one-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
