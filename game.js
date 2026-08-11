const GAME_VERSION = "0.1";

let game = {
    money: 500,
    reputation: 1,
    cityLevel: 1,
    experience: 0,
    totalEarned: 0,
    businesses: {},
    upgrades: {},
    achievements: {}
};

const businesses = [
    {
        id: "coffee",
        icon: "☕",
        name: "Neon Coffee",
        description: "A small coffee shop that attracts local customers.",
        baseCost: 250,
        baseIncome: 4,
        baseEmployees: 1
    },
    {
        id: "arcade",
        icon: "🕹️",
        name: "Cyber Arcade",
        description: "Retro games, neon lights and extremely questionable decisions.",
        baseCost: 1200,
        baseIncome: 18,
        baseEmployees: 2
    },
    {
        id: "restaurant",
        icon: "🍜",
        name: "Night Market",
        description: "A high-volume restaurant serving the city's night crowd.",
        baseCost: 6500,
        baseIncome: 75,
        baseEmployees: 5
    },
    {
        id: "tower",
        icon: "🏢",
        name: "Neon Tower",
        description: "A premium commercial building that transforms your district.",
        baseCost: 40000,
        baseIncome: 500,
        baseEmployees: 12
    }
];

const upgrades = [
    {
        id: "marketing",
        name: "Digital Marketing",
        description: "+15% income from every business.",
        cost: 2500
    },
    {
        id: "automation",
        name: "Smart Automation",
        description: "+25% income and reduces employee costs.",
        cost: 10000
    },
    {
        id: "reputation",
        name: "City Branding",
        description: "+2 reputation whenever you buy a business.",
        cost: 25000
    },
    {
        id: "efficiency",
        name: "Quantum Efficiency",
        description: "+50% total business income.",
        cost: 100000
    }
];

const achievements = [
    {
        id: "first",
        icon: "🏪",
        name: "First Investment",
        description: "Buy your first business.",
        check: () => ownedBusinesses() >= 1
    },
    {
        id: "million",
        icon: "💰",
        name: "Millionaire",
        description: "Earn $1,000,000 total.",
        check: () => game.totalEarned >= 1000000
    },
    {
        id: "city",
        icon: "🏙️",
        name: "Growing City",
        description: "Reach city level 10.",
        check: () => game.cityLevel >= 10
    },
    {
        id: "empire",
        icon: "👑",
        name: "Empire",
        description: "Own every business.",
        check: () => ownedBusinesses() >= businesses.length
    }
];

function formatMoney(number) {
    if (number < 1000) {
        return "$" + Math.floor(number);
    }

    const suffixes = ["K", "M", "B", "T", "Qa", "Qi"];

    let index = -1;
    let value = number;

    while (value >= 1000 && index < suffixes.length - 1) {
        value /= 1000;
        index++;
    }

    return "$" + value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2) + suffixes[index];
}

function ownedBusinesses() {
    return Object.values(game.businesses).filter(Boolean).length;
}

function getBusiness(id) {
    return businesses.find(b => b.id === id);
}

function getBusinessCost(business) {
    const owned = game.businesses[business.id] ? 1 : 0;

    return Math.floor(
        business.baseCost *
        Math.pow(1.15, owned)
    );
}

function getIncomeMultiplier() {
    let multiplier = 1;

    if (game.upgrades.marketing) {
        multiplier *= 1.15;
    }

    if (game.upgrades.automation) {
        multiplier *= 1.25;
    }

    if (game.upgrades.efficiency) {
        multiplier *= 1.5;
    }

    return multiplier;
}

function calculateIncome() {
    let income = 0;

    for (const business of businesses) {
        if (game.businesses[business.id]) {
            income += business.baseIncome;
        }
    }

    income *= getIncomeMultiplier();

    return income;
}

function calculateExpenses() {
    let employees = 0;

    for (const business of businesses) {
        if (game.businesses[business.id]) {
            employees += business.baseEmployees;
        }
    }

    let employeeCost = employees * 0.7;

    if (game.upgrades.automation) {
        employeeCost *= 0.75;
    }

    return employeeCost;
}

function calculateProfit() {
    return Math.max(0, calculateIncome() - calculateExpenses());
}

function buyBusiness(id) {
    const business = getBusiness(id);

    if (!business) return;
    if (game.businesses[id]) {
        notify("You already own this business.");
        return;
    }

    const cost = getBusinessCost(business);

    if (game.money < cost) {
        notify("Not enough cash.");
        return;
    }

    game.money -= cost;
    game.businesses[id] = true;

    game.experience += business.baseIncome * 5;

    if (game.upgrades.reputation) {
        game.reputation += 2;
    } else {
        game.reputation += 1;
    }

    notify(`${business.icon} ${business.name} acquired!`);

    checkLevel();
    checkAchievements();
    render();
}

function buyUpgrade(id) {
    const upgrade = upgrades.find(u => u.id === id);

    if (!upgrade) return;

    if (game.upgrades[id]) {
        notify("Upgrade already purchased.");
        return;
    }

    if (game.money < upgrade.cost) {
        notify("Not enough cash.");
        return;
    }

    game.money -= upgrade.cost;
    game.upgrades[id] = true;

    notify(`⬆️ ${upgrade.name} unlocked!`);

    render();
}

function checkLevel() {
    const required = game.cityLevel * 1000;

    while (game.experience >= required) {
        game.experience -= required;
        game.cityLevel++;

        notify(`🏙️ City Level ${game.cityLevel} reached!`);
    }
}

function checkAchievements() {
    for (const achievement of achievements) {
        if (!game.achievements[achievement.id] && achievement.check()) {
            game.achievements[achievement.id] = true;
            notify(`🏆 Achievement: ${achievement.name}`);
        }
    }
}

function notify(message) {
    const container = document.getElementById("notificationContainer");

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3500);
}

function renderBusinesses() {
    const container = document.getElementById("businesses");

    container.innerHTML = businesses.map(business => {
        const owned = game.businesses[business.id];
        const cost = getBusinessCost(business);

        return `
            <div class="business">
                <div class="business-top">
                    <div>
                        <span class="business-icon">${business.icon}</span>
                        <span class="business-name">${business.name}</span>
                    </div>
                    <strong>${owned ? "OWNED" : formatMoney(cost)}</strong>
                </div>

                <div class="business-info">
                    ${business.description}<br>
                    Income: +${formatMoney(business.baseIncome)}/sec
                    • Employees: ${business.baseEmployees}
                </div>

                <button
                    onclick="buyBusiness('${business.id}')"
                    ${owned || game.money < cost ? "disabled" : ""}
                >
                    ${owned ? "BUSINESS OWNED" : "ACQUIRE BUSINESS"}
                </button>
            </div>
        `;
    }).join("");

    document.getElementById("businessCount").textContent =
        `${ownedBusinesses()} / ${businesses.length}`;
}

function renderUpgrades() {
    const container = document.getElementById("upgrades");

    container.innerHTML = upgrades.map(upgrade => {
        const owned = game.upgrades[upgrade.id];

        return `
            <div class="upgrade">
                <h4>${upgrade.name}</h4>

                <p>${upgrade.description}</p>

                <button
                    onclick="buyUpgrade('${upgrade.id}')"
                    ${owned || game.money < upgrade.cost ? "disabled" : ""}
                >
                    ${owned ? "UNLOCKED" : formatMoney(upgrade.cost)}
                </button>
            </div>
        `;
    }).join("");
}

function renderAchievements() {
    const container = document.getElementById("achievements");

    container.innerHTML = achievements.map(achievement => {
        const unlocked = game.achievements[achievement.id];

        return `
            <div class="achievement ${unlocked ? "" : "locked"}">
                <div class="achievement-icon">
                    ${achievement.icon}
                </div>

                <div>
                    <strong>${achievement.name}</strong>
                    <small>${achievement.description}</small>
                </div>
            </div>
        `;
    }).join("");
}

function render() {
    document.getElementById("money").textContent =
        formatMoney(game.money);

    document.getElementById("income").textContent =
        formatMoney(calculateProfit());

    document.getElementById("reputation").textContent =
        Math.floor(game.reputation);

    document.getElementById("district").textContent =
        game.cityLevel;

    document.getElementById("cityLevel").textContent =
        game.cityLevel;

    const required = game.cityLevel * 1000;
    const progress = Math.min(
        100,
        (game.experience / required) * 100
    );

    document.getElementById("levelProgress").style.width =
        progress + "%";

    renderBusinesses();
    renderUpgrades();
    renderAchievements();
}

function saveGame() {
    localStorage.setItem(
        "neonCityTycoon",
        JSON.stringify(game)
    );

    notify("💾 Game saved.");
}

function loadGame() {
    const saved = localStorage.getItem("neonCityTycoon");

    if (!saved) return;

    try {
        const loaded = JSON.parse(saved);

        game = {
            ...game,
            ...loaded
        };
    } catch {
        console.warn("Save data could not be loaded.");
    }
}

function resetGame() {
    const confirmed = confirm(
        "Reset your entire city? This cannot be undone."
    );

    if (!confirmed) return;

    localStorage.removeItem("neonCityTycoon");

    location.reload();
}

function offlineProgress() {
    const lastPlayed = Number(
        localStorage.getItem("neonCityLastPlayed")
    );

    if (!lastPlayed) return;

    const secondsAway =
        Math.min(
            60 * 60 * 8,
            (Date.now() - lastPlayed) / 1000
        );

    if (secondsAway < 10) return;

    const earned = calculateProfit() * secondsAway;

    if (earned <= 0) return;

    game.money += earned;
    game.totalEarned += earned;

    notify(
        `💤 While you were away, your city earned ${formatMoney(earned)}.`
    );
}

function gameTick() {
    const profit = calculateProfit();

    game.money += profit;
    game.totalEarned += profit;

    game.experience += profit * 0.01;

    checkLevel();
    checkAchievements();

    render();
}

setInterval(gameTick, 1000);

setInterval(() => {
    saveGameSilent();
}, 10000);

function saveGameSilent() {
    localStorage.setItem(
        "neonCityTycoon",
        JSON.stringify(game)
    );

    localStorage.setItem(
        "neonCityLastPlayed",
        Date.now().toString()
    );
}

window.addEventListener("beforeunload", saveGameSilent);

loadGame();
offlineProgress();
render();
