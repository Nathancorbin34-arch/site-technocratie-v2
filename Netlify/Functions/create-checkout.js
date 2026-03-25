const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  Technocratie: "price_1TCzlDDgxuY1Jr5i9NyeIec6",
  Zaagocratie: "price_1TCh80DgxuY1Jr5iALnoleT8",
  Uptempocratie: "price_1TCh6PDgxuY1Jr5i0FabyT6C",
  Rawcratie: "price_1TCh3aDgxuY1Jr5iqvYqfTZA"
};

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Méthode non autorisée" })
      };
    }

    const { cart } = JSON.parse(event.body);

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Panier vide" })
      };
    }

    const line_items = cart.map((item) => {
      const price = PRICE_MAP[item.name];

      if (!price) {
        throw new Error(`Produit inconnu : ${item.name}`);
      }

      return {
        price,
        quantity: item.quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: "https://technocratie-wear.fr/?success=1",
      cancel_url: "https://technocratie-wear.fr/?cancel=1"
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Erreur serveur"
      })
    };
  }
};