const wizardElement = document.getElementById("wizard");

const state = {
  data: {},
  history: [],
};

const nodes = {
  start: {
    type: "question",
    title: "Jaki jest status prawny Twojego klienta?",
    description:
      "To kluczowe pytanie decydujące o ścieżce kwalifikacji. Wybierz opcję, która najlepiej opisuje klienta.",
    options: [
      {
        label: "Osoba fizyczna (nie prowadzi działalności)",
        next: "A_income",
        setState: { clientType: "consumer" },
      },
      {
        label: "Przedsiębiorca (JDG / rolnik)",
        next: "B_goal",
        setState: { clientType: "entrepreneur" },
      },
      {
        label: "Spółka z o.o.",
        next: "C_intent",
        setState: { clientType: "company" },
      },
    ],
  },
  A_income: {
    type: "question",
    title: "Czy klient posiada stałe, udokumentowane źródło dochodu?",
    description:
      "Stały dochód otwiera drogę do negocjacji z wierzycielami. Brak takiego dochodu wskazuje na niewypłacalność.",
    options: [
      {
        label: "Tak, posiada stabilne i udokumentowane dochody.",
        next: "A_property",
        setState: { income: "stable" },
      },
      {
        label: "Nie, dochody są nieregularne lub ich brak.",
        next: "A_property",
        setState: { income: "unstable" },
      },
    ],
  },
  A_property: {
    type: "question",
    title: "Czy klient jest właścicielem nieruchomości zagrożonej egzekucją?",
    description:
      "Jeżeli nieruchomość jest zagrożona, jej ochrona staje się absolutnym priorytetem niezależnie od innych odpowiedzi.",
    options: [
      {
        label: "Tak, nieruchomość wymaga pilnej ochrony.",
        next: "resultOchrona",
      },
      {
        label: "Nie, nie ma zagrożonej nieruchomości.",
        next: (ctx) =>
          ctx.data.income === "stable" ? "resultUgoda" : "resultUpadlosc",
      },
    ],
  },
  B_goal: {
    type: "question",
    title: "Jaki jest główny cel klienta przedsiębiorcy?",
    description:
      "Określ, czy klient chce ratować firmę, czy zakończyć działalność i skupić się na pełnym oddłużeniu.",
    options: [
      {
        label: "Chcemy uratować firmę i kontynuować działalność.",
        next: "resultRestrukturyzacja",
      },
      {
        label: "Chcemy zamknąć firmę i oddłużyć się jak osoba fizyczna.",
        next: "B_redirect",
        setState: { entrepreneurExit: true },
      },
    ],
  },
  B_redirect: {
    type: "info",
    title: "Kontynuujemy jak dla osoby fizycznej",
    message:
      "Długi firmy stają się długami osobistymi. Po zamknięciu działalności klient jest kwalifikowany jak osoba fizyczna.",
    note: "Kliknij \"Dalej\", aby przejść do kolejnych pytań.",
    next: "A_income",
  },
  C_intent: {
    type: "question",
    title:
      "Czy celem zarządu jest bezpieczne i zgodne z prawem zakończenie działalności spółki z o.o.?",
    description:
      "To pytanie weryfikuje potrzebę specjalistycznej usługi, która pozwala uniknąć odpowiedzialności z art. 299 KSH.",
    options: [
      {
        label: "Tak, chcemy pozbyć się problemu zadłużonej spółki.",
        next: "resultSpolkaPozbycie",
      },
      {
        label: "Nie, chcemy ratować spółkę.",
        next: "handoffSpolka",
      },
    ],
  },
  resultOchrona: {
    type: "result",
    recommendation: "Ochrona Prawna Nieruchomości",
    chance: 85,
    reasoning:
      "Priorytetem jest zabezpieczenie dachu nad głową klienta. To działanie można prowadzić równolegle do dalszych kroków oddłużeniowych.",
  },
  resultUgoda: {
    type: "result",
    recommendation: "Ugoda Konsumencka",
    chance: 75,
    reasoning:
      "Klient posiada zdolność do spłaty, co pozwala na renegocjację warunków z wierzycielami i uniknięcie upadłości.",
  },
  resultUpadlosc: {
    type: "result",
    recommendation: "Upadłość Konsumencka",
    chance: 90,
    reasoning:
      "Brak stałych dochodów wskazuje na trwałą niewypłacalność. Upadłość pozwoli klientowi na pełne oddłużenie i nowy start.",
  },
  resultRestrukturyzacja: {
    type: "result",
    recommendation: "Restrukturyzacja Biznesowa",
    chance: 70,
    reasoning:
      "Proces restrukturyzacji chroni firmę przed wierzycielami i daje czas na wprowadzenie realnego planu naprawczego.",
  },
  resultSpolkaPozbycie: {
    type: "result",
    recommendation: "Pozbycie się zadłużonej spółki z o.o.",
    chance: 95,
    reasoning:
      "To wyspecjalizowana procedura zapewniająca zgodne z prawem wyjście z zadłużonej spółki i ochronę prywatnego majątku zarządu.",
  },
  handoffSpolka: {
    type: "info",
    title: "Konieczna indywidualna konsultacja",
    message:
      "W przypadku ratowania spółki rekomendujemy bezpośredni kontakt z Dedykowanym Opiekunem w celu przygotowania niestandardowego planu działań.",
    note: "Ta usługa nie znajduje się w standardowym kreatorze.",
    next: null,
  },
};

function renderNode(nodeId, { pushHistory = true } = {}) {
  const node = nodes[nodeId];
  if (!node) {
    console.error(`Nie znaleziono kroku o identyfikatorze ${nodeId}`);
    return;
  }

  if (pushHistory) {
    state.history.push(nodeId);
  }

  wizardElement.innerHTML = "";

  switch (node.type) {
    case "question":
      renderQuestion(nodeId, node);
      break;
    case "result":
      renderResult(nodeId, node);
      break;
    case "info":
      renderInfo(nodeId, node);
      break;
    default:
      console.warn(`Nieobsługiwany typ kroku: ${node.type}`);
  }
}

function renderQuestion(nodeId, node) {
  const card = document.createElement("article");
  card.className = "card";

  const title = document.createElement("h2");
  title.className = "card__title";
  title.textContent = node.title;
  card.appendChild(title);

  if (node.description) {
    const description = document.createElement("p");
    description.className = "card__description";
    description.textContent = node.description;
    card.appendChild(description);
  }

  const options = document.createElement("div");
  options.className = "options";

  node.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "button";
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => handleOptionSelect(option));
    options.appendChild(button);
  });

  card.appendChild(options);

  if (state.history.length > 1) {
    const backButton = document.createElement("button");
    backButton.className = "button button--ghost";
    backButton.type = "button";
    backButton.textContent = "Wróć";
    backButton.addEventListener("click", handleBack);
    card.appendChild(backButton);
  }

  wizardElement.appendChild(card);
}

function renderResult(nodeId, node) {
  const card = document.createElement("article");
  card.className = "card summary";

  const badge = document.createElement("div");
  badge.className = "summary__badge";
  badge.textContent = "Rekomendacja";
  card.appendChild(badge);

  const title = document.createElement("h2");
  title.className = "summary__title";
  title.textContent = node.recommendation;
  card.appendChild(title);

  const chance = document.createElement("p");
  chance.className = "summary__chance";
  chance.textContent = `Szansa na sukces: ${node.chance}%`;
  card.appendChild(chance);

  const reasoning = document.createElement("p");
  reasoning.className = "card__description";
  reasoning.textContent = node.reasoning;
  card.appendChild(reasoning);

  const actions = document.createElement("div");
  actions.className = "actions";

  const createCaseButton = document.createElement("button");
  createCaseButton.className = "button button--primary";
  createCaseButton.type = "button";
  createCaseButton.textContent = "Utwórz sprawę dla klienta";
  createCaseButton.addEventListener("click", () => {
    window.alert("Funkcjonalność tworzenia sprawy zostanie dodana w panelu produkcyjnym.");
  });
  actions.appendChild(createCaseButton);

  const restartButton = document.createElement("button");
  restartButton.className = "button";
  restartButton.type = "button";
  restartButton.textContent = "Rozpocznij od nowa";
  restartButton.addEventListener("click", resetWizard);
  actions.appendChild(restartButton);

  card.appendChild(actions);
  wizardElement.appendChild(card);
}

function renderInfo(nodeId, node) {
  const card = document.createElement("article");
  card.className = "card";

  const title = document.createElement("h2");
  title.className = "card__title";
  title.textContent = node.title;
  card.appendChild(title);

  if (node.message) {
    const message = document.createElement("p");
    message.className = "card__description";
    message.textContent = node.message;
    card.appendChild(message);
  }

  if (node.note) {
    const note = document.createElement("p");
    note.className = "card__description";
    note.style.fontStyle = "italic";
    note.textContent = node.note;
    card.appendChild(note);
  }

  const actions = document.createElement("div");
  actions.className = "actions";

  if (node.next) {
    const nextButton = document.createElement("button");
    nextButton.className = "button button--primary";
    nextButton.type = "button";
    nextButton.textContent = "Dalej";
    nextButton.addEventListener("click", () => navigateTo(node.next));
    actions.appendChild(nextButton);
  }

  const restartButton = document.createElement("button");
  restartButton.className = "button";
  restartButton.type = "button";
  restartButton.textContent = node.next ? "Rozpocznij od nowa" : "Zakończ i rozpocznij od nowa";
  restartButton.addEventListener("click", resetWizard);
  actions.appendChild(restartButton);

  if (state.history.length > 1) {
    const backButton = document.createElement("button");
    backButton.className = "button button--ghost";
    backButton.type = "button";
    backButton.textContent = "Wróć";
    backButton.addEventListener("click", handleBack);
    actions.appendChild(backButton);
  }

  card.appendChild(actions);
  wizardElement.appendChild(card);
}

function handleOptionSelect(option) {
  if (option.setState) {
    Object.assign(state.data, option.setState);
  }

  const next = typeof option.next === "function" ? option.next(state) : option.next;
  if (!next) {
    console.error("Opcja nie posiada kolejnego kroku");
    return;
  }

  navigateTo(next);
}

function handleBack() {
  if (state.history.length <= 1) return;
  state.history.pop();
  const previousId = state.history[state.history.length - 1];
  renderNode(previousId, { pushHistory: false });
}

function navigateTo(nodeId) {
  renderNode(nodeId, { pushHistory: true });
}

function resetWizard() {
  state.data = {};
  state.history = [];
  renderNode("start");
}

resetWizard();
