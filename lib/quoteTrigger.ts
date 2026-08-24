// lib/quoteTrigger.ts

export function triggerCarQuote(car: {
  brandName?: string;
  modelName: string;
  monthlyRent?: number;
  slug?: string;
}) {
  const priceText =
    car.monthlyRent && car.monthlyRent > 0
      ? ` (월 ${car.monthlyRent.toLocaleString()}원~)`
      : "";
  const brandPrefix = car.brandName ? `[${car.brandName}] ` : "";
  const carText = `${brandPrefix}${car.modelName}${priceText}`;

  if (typeof window !== "undefined") {
    const formEl = document.getElementById("quote-form");
    if (formEl) {
      window.dispatchEvent(
        new CustomEvent("select-car-for-quote", {
          detail: { carName: carText },
        })
      );
      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
      const nameInput = formEl.querySelector<HTMLInputElement>("input[required]");
      if (nameInput) {
        setTimeout(() => nameInput.focus(), 500);
      }
    } else {
      const encoded = encodeURIComponent(carText);
      window.location.href = `/?car=${encoded}#quote-form`;
    }
  }
}
