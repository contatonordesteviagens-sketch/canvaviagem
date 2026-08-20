const fs = require('fs');
let code = fs.readFileSync('src/pages/Inicio2.tsx', 'utf8');

// Replace the button onClick to just redirect to Stripe links
code = code.replace(
  /onClick=\{\(\) => \{\s+if \(checkoutLoading\) return;\s+const selectedPlan = plans\[activePlan\];\s+const billingCycle = selectedPlan\.id === "mensal"\s+\? "monthly"\s+: selectedPlan\.id === "semestral"\s+\? "semiannual"\s+: "annual";\s+void startEliteCheckout\(\s+billingCycle,\s+selectedPlan\.trackValue,\s+\);\s+\}\}/g,
  `onClick={() => {
                      const selectedPlan = plans[activePlan];
                      if (selectedPlan.id === "mensal") {
                        window.location.href = "https://buy.stripe.com/fZucN6bma6QEeH96kI8so0c";
                      } else if (selectedPlan.id === "anual") {
                        window.location.href = "https://buy.stripe.com/fZu14ogGugreeH9bF28so0d";
                      } else if (selectedPlan.id === "semestral") {
                        // TODO: Update this link when the user provides the semestral stripe link
                        alert("Link do plano semestral não configurado. Por favor, escolha mensal ou anual.");
                      }
                    }}`
);

fs.writeFileSync('src/pages/Inicio2.tsx', code);
console.log('done');
