type MerchantFixture = {
  merchantId: string;
  session: {
    user: {
      id: string;
      email: string;
      role: "MERCHANT";
    };
  };
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subscription: "FREE" | "PRO" | "BUSINESS";
    createdAt: string;
  };
  stores: Array<{ id: string } & Record<string, unknown>>;
  apiKeys: Array<{ id: string; storeId: string } & Record<string, unknown>>;
  orders: Array<{ id: string; storeId: string } & Record<string, unknown>>;
  orderDetails: Array<{ orderId: string } & Record<string, unknown>>;
};

type DashboardDataOverrides = Partial<
  Pick<MerchantFixture, "apiKeys" | "orderDetails" | "orders" | "stores">
>;

declare global {
  namespace Cypress {
    interface Chainable {
      mockGuestSession(): Chainable<void>;
      mockMerchantSession(): Chainable<MerchantFixture>;
      stubMerchantDashboardData(
        overrides?: DashboardDataOverrides,
      ): Chainable<MerchantFixture>;
    }
  }
}

Cypress.Commands.add("mockGuestSession", () => {
  cy.intercept("POST", "/api/auth/refresh", {
    statusCode: 401,
    body: { message: "Session absente." },
  }).as("refreshSession");
});

Cypress.Commands.add("mockMerchantSession", () => {
  return cy.fixture<MerchantFixture>("merchant").then((merchant) => {
    cy.intercept("POST", "/api/auth/refresh", {
      statusCode: 200,
      body: merchant.session,
    }).as("refreshSession");

    cy.intercept("GET", `/api/merchants/${merchant.merchantId}`, {
      statusCode: 200,
      body: merchant.profile,
    }).as("merchantProfile");

    cy.intercept("PATCH", `/api/merchants/${merchant.merchantId}`, (request) => {
      request.reply({
        statusCode: 200,
        body: {
          ...merchant.profile,
          ...request.body,
        },
      });
    }).as("updateMerchantProfile");

    return cy.wrap(merchant, { log: false });
  });
});

Cypress.Commands.add("stubMerchantDashboardData", (overrides = {}) => {
  return cy.fixture<MerchantFixture>("merchant").then((merchant) => {
    const stores = overrides.stores ?? merchant.stores;
    const orders = overrides.orders ?? merchant.orders;
    const apiKeys = overrides.apiKeys ?? merchant.apiKeys;
    const orderDetails = overrides.orderDetails ?? merchant.orderDetails;

    cy.intercept(
      {
        method: "GET",
        pathname: `/api/merchants/${merchant.merchantId}/stores`,
      },
      { statusCode: 200, body: stores },
    ).as("listStores");

    cy.intercept(
      {
        method: "GET",
        pathname: `/api/merchants/${merchant.merchantId}/orders`,
      },
      { statusCode: 200, body: orders },
    ).as("listOrders");

    cy.intercept(
      {
        method: "GET",
        pathname: `/api/merchants/${merchant.merchantId}/api-keys`,
      },
      { statusCode: 200, body: apiKeys },
    ).as("listApiKeys");

    cy.intercept("GET", `/api/merchants/${merchant.merchantId}/stores/*`, (request) => {
      const storeId = request.url.split("/stores/")[1]?.split("?")[0];
      const store = stores.find((candidate) => candidate.id === storeId);

      request.reply({
        statusCode: store ? 200 : 404,
        body: store ?? { message: "Magasin introuvable." },
      });
    }).as("getStore");

    cy.intercept("GET", `/api/merchants/${merchant.merchantId}/orders/*`, (request) => {
      const orderId = request.url.split("/orders/")[1]?.split("?")[0];
      const order = orderDetails.find((candidate) => candidate.orderId === orderId);

      request.reply({
        statusCode: order ? 200 : 404,
        body: order ?? { message: "Commande introuvable." },
      });
    }).as("getOrder");

    cy.intercept("GET", "https://api-adresse.data.gouv.fr/search/**", {
      statusCode: 200,
      body: {
        features: [
          {
            geometry: {
              coordinates: [5.735, 45.184],
            },
          },
        ],
      },
    });

    cy.intercept("GET", "https://photon.komoot.io/api/**", {
      statusCode: 200,
      body: { features: [] },
    });

    cy.intercept("GET", "/api/ws-token", {
      statusCode: 200,
      body: { wsToken: "merchant-lidl-ws-token" },
    });

    return cy.wrap({
      ...merchant,
      stores,
      orders,
      apiKeys,
      orderDetails,
    }, { log: false });
  });
});

export {};
