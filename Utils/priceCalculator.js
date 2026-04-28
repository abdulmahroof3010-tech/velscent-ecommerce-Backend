const offerModel=require("../Models/offerModel");

const calculateFinalPrice = (product,offers=[]) => {
  let regularDiscount = product.discount_percentage || 0;

   const matchedOffers = offers.filter(
    o => o.applicableType === product.type
  );

   const bestOffer = matchedOffers.sort(
    (a, b) => b.discount_percentage - a.discount_percentage
  )[0];

   const offerDiscount = bestOffer?.discount_percentage || 0;
  
  const finalDiscount = Math.max(regularDiscount, offerDiscount);

  const salePrice = Math.round(
    product.original_price -
    (product.original_price * finalDiscount) / 100
  );

  return {
    salePrice,
    discount: finalDiscount,
    offerName: bestOffer?.name || null
  };
};

module.exports=calculateFinalPrice;