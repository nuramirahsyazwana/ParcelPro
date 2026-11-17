(function () {
  const baseRates = {
    Malaysia: 6,
    Indonesia: 28,
    Brunei: 24,
    Singapore: 22,
    Thailand: 30
  };

  function calculate(country, weight, packageType) {
    const destination = country || "Malaysia";
    const parcelWeight = Math.max(0.1, Number(weight) || 0.1);

    const packageFees = {
      document: 0,
      small: 4,
      medium: 9,
      large: 16
    };

    const basePrice = baseRates[destination] ?? 35;
    const international = destination !== "Malaysia";
    const extraWeight = Math.max(0, parcelWeight - 1);
    const weightRate = international ? 7 : 2.5;
    const packageFee = packageFees[packageType] ?? 4;

    return Number(
      (basePrice + extraWeight * weightRate + packageFee).toFixed(2)
    );
  }

  function money(value) {
    return "RM " + (Number(value) || 0).toFixed(2);
  }

  window.ParcelProShipping = {
    calculate,
    money
  };
})();