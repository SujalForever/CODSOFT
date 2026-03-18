// ─── State ───────────────────────────────────────────────────
let display = "0";
let prevValue = null;
let operator = null;
let waitingForOperand = false;
let expression = "";

const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");

// ─── Helpers ─────────────────────────────────────────────────
function opSymbol(op) {
    return op === "/" ? "÷" : op === "*" ? "×" : op === "-" ? "−" : "+";
}

function formatNumber(str) {
    if (str === "Error") return "Error";
    const parts = str.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function updateDisplay() {
    const formatted = formatNumber(display);
    resultEl.textContent = formatted;

    const len = formatted.replace(/[,\s]/g, "").length;
    resultEl.className = "result";
    if (len > 12) resultEl.classList.add("shrink-4");
    else if (len > 9) resultEl.classList.add("shrink-3");
    else if (len > 6) resultEl.classList.add("shrink-2");

    expressionEl.textContent = expression || "\u00a0";

    document.querySelectorAll(".btn.op").forEach(btn => {
        btn.classList.toggle("active",
            operator && waitingForOperand &&
            opSymbol(btn.dataset.action) === opSymbol(operator)
        );
    });
}

// ─── Actions ─────────────────────────────────────────────────
function clear() {
    display = "0"; prevValue = null; operator = null;
    waitingForOperand = false; expression = "";
}

function inputDigit(digit) {
    if (waitingForOperand) {
        display = digit === "." ? "0." : digit;
        waitingForOperand = false;
    } else {
        if (digit === "." && display.includes(".")) return;
        display = (display === "0" && digit !== ".") ? digit : display + digit;
    }
}

function calculate(a, op, b) {
    a = parseFloat(a); b = parseFloat(b);
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? NaN : a / b;
        default: return b;
    }
}

function handleOperator(op) {
    if (prevValue !== null && !waitingForOperand) {
        const result = calculate(prevValue, operator, display);
        const str = isNaN(result) ? "Error" : String(parseFloat(result.toPrecision(12)));
        display = str; prevValue = str;
        expression = str + " " + opSymbol(op);
    } else {
        prevValue = display;
        expression = display + " " + opSymbol(op);
    }
    operator = op; waitingForOperand = true;
}

function handleEquals() {
    if (!operator || prevValue === null) return;
    const result = calculate(prevValue, operator, display);
    const str = isNaN(result) ? "Error" : String(parseFloat(result.toPrecision(12)));
    expression = prevValue + " " + opSymbol(operator) + " " + display + " =";
    display = str;
    prevValue = null; operator = null; waitingForOperand = true;
}

function handleNegate() {
    if (display === "0" || display === "Error") return;
    display = display.startsWith("-") ? display.slice(1) : "-" + display;
}

function handlePercent() {
    const val = parseFloat(display);
    if (!isNaN(val)) { display = String(val / 100); waitingForOperand = false; }
}

// ─── Events ──────────────────────────────────────────────────
document.querySelector(".buttons").addEventListener("click", e => {
    const btn = e.target.closest(".btn");
    const action = btn?.dataset.action;
    if (!action) return;

    switch (action) {
        case "clear": clear(); break;
        case "negate": handleNegate(); break;
        case "percent": handlePercent(); break;
        case "=": handleEquals(); break;
        case "+": case "-": case "*": case "/": handleOperator(action); break;
        default: inputDigit(action);
    }
    updateDisplay();
});

document.addEventListener("keydown", e => {
    if (e.key >= "0" && e.key <= "9") inputDigit(e.key);
    else if (e.key === ".") inputDigit(".");
    else if (e.key === "+") handleOperator("+");
    else if (e.key === "-") handleOperator("-");
    else if (e.key === "*") handleOperator("*");
    else if (e.key === "/") { e.preventDefault(); handleOperator("/"); }
    else if (e.key === "Enter" || e.key === "=") handleEquals();
    else if (e.key === "Backspace") { display = display.length > 1 ? display.slice(0, -1) : "0"; }
    else if (e.key === "Escape") clear();
    else if (e.key === "%") handlePercent();
    else return;
    updateDisplay();
});

updateDisplay();