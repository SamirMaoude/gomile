describe("Espace merchant", () => {
  function stubCreateStore(merchantId: string) {
    cy.intercept("POST", `/api/merchants/${merchantId}/stores`, {
      statusCode: 201,
      body: {
        id: "store-amazon-lyon",
        name: "Amazon Lyon Part-Dieu",
      },
    }).as("createStore");
  }

  function stubCreateOrder(merchantId: string, storeId: string) {
    cy.intercept("POST", `/api/merchants/${merchantId}/stores/${storeId}/orders`, {
      statusCode: 201,
      body: {
        orderId: "order-lidl-grenoble-001",
        deliveryCode: "482913",
        deliveryFee: 7.4,
        distanceKm: 3.2,
        status: "SEARCHING_DRIVER",
        message: "Commande créée avec succès.",
      },
    }).as("createOrder");
  }

  function stubCreateApiKey(merchantId: string) {
    cy.intercept("POST", `/api/merchants/${merchantId}/api-keys`, {
      statusCode: 201,
      body: {
        id: "api-key-amazon-production",
        name: "Amazon production",
        apiKey: "gm_live_amazon_production_7f4b9c",
        createdAt: "2026-05-17T09:30:00.000Z",
      },
    }).as("createApiKey");
  }

  it("valide le formulaire de connexion merchant et affiche les erreurs API", () => {
    cy.mockGuestSession();
    cy.visit("/merchant/login");

    cy.contains("h1", "Connexion").should("be.visible");
    cy.contains("button", "Se connecter").click();
    cy.contains("Renseignez votre adresse e-mail et votre mot de passe.").should(
      "be.visible",
    );

    cy.get('input[aria-label="Adresse e-mail"]').type("claire.martin@example.com");
    cy.get('input[aria-label="Mot de passe"]').type("wrong-password");
    cy.get('button[aria-label="Afficher le mot de passe"]').click();
    cy.get('input[aria-label="Mot de passe"]').should("have.attr", "type", "text");

    cy.intercept("POST", "/api/auth/login", {
      statusCode: 401,
      body: { message: "Identifiants invalides." },
    }).as("loginFailure");

    cy.contains("button", "Se connecter").click();
    cy.wait("@loginFailure");
    cy.contains("Identifiants invalides.").should("be.visible");
  });

  it("refuse la connexion d'un compte non merchant", () => {
    cy.mockGuestSession();
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 200,
      body: {
        user: {
          id: "driver-thomas-bernard",
          email: "thomas.bernard@example.com",
          role: "DRIVER",
        },
      },
    }).as("driverLogin");
    cy.intercept("POST", "/api/auth/logout", {
      statusCode: 200,
      body: { message: "Déconnecté." },
    }).as("logoutDriver");

    cy.visit("/merchant/login");
    cy.get('input[aria-label="Adresse e-mail"]').type("thomas.bernard@example.com");
    cy.get('input[aria-label="Mot de passe"]').type("Password123!");
    cy.contains("button", "Se connecter").click();

    cy.wait("@driverLogin");
    cy.wait("@logoutDriver");
    cy.contains("Ce compte n'est pas un compte marchand.").should("be.visible");
    cy.location("pathname").should("eq", "/merchant/login");
  });

  it("connecte un merchant et redirige vers son dashboard front", () => {
    cy.fixture("merchant").then((merchant) => {
      cy.mockGuestSession();
      cy.stubMerchantDashboardData({ apiKeys: [], orders: [], stores: [] });

      cy.intercept("POST", "/api/auth/login", {
        statusCode: 200,
        body: merchant.session,
      }).as("loginSuccess");

      cy.intercept("GET", `/api/merchants/${merchant.merchantId}`, {
        statusCode: 200,
        body: merchant.profile,
      }).as("merchantProfile");

      cy.visit("/merchant/login");
      cy.get('input[aria-label="Adresse e-mail"]').type(merchant.profile.email);
      cy.get('input[aria-label="Mot de passe"]').type("Password123!");
      cy.contains("button", "Se connecter").click();

      cy.wait("@loginSuccess")
        .its("request.body")
        .should("deep.equal", {
          identifier: merchant.profile.email,
          password: "Password123!",
        });
      cy.location("pathname", { timeout: 20000 }).should("eq", "/merchant/dashboard");
      cy.contains("Suivi des commandes").should("be.visible");
      cy.contains("Aucune commande créée récemment.").should("be.visible");
    });
  });

  it("valide l'inscription merchant et envoie le bon payload", () => {
    cy.fixture("merchant").then((merchant) => {
      cy.intercept("POST", "/api/auth/register/merchant", {
        statusCode: 200,
        body: merchant.session,
      }).as("registerMerchant");
      cy.intercept("POST", "/api/auth/logout", {
        statusCode: 200,
        body: { message: "Déconnecté." },
      }).as("logoutAfterRegister");

      cy.visit("/merchant/register");
      cy.contains("button", "Créer mon compte").click();
      cy.contains("Renseignez le nom du commerce, l'e-mail et le mot de passe.").should(
        "be.visible",
      );

      cy.get('input[aria-label="Nom du commerce"]').type("Amazon Business");
      cy.get('input[aria-label="Adresse e-mail"]').type("sophie.durand@example.com");
      cy.get('input[aria-label="Mot de passe"]').type("short");
      cy.contains("button", "Créer mon compte").click();
      cy.contains("Le mot de passe doit contenir au moins 8 caractères.").should(
        "be.visible",
      );

      cy.get('input[aria-label="Mot de passe"]').clear().type("Password123!");
      cy.contains("button", "Créer mon compte").click();

      cy.wait("@registerMerchant")
        .its("request.body")
        .should("include", {
          name: "Amazon Business",
          email: "sophie.durand@example.com",
          password: "Password123!",
        });
      cy.contains("Valide ton compte mail").should("be.visible");
      cy.wait("@logoutAfterRegister");
    });
  });

  it("met à jour les paramètres du merchant", () => {
    cy.mockMerchantSession();

    cy.visit("/merchant/dashboard/settings");
    cy.contains("Paramètres du merchant").should("be.visible");
    cy.get('input[aria-label="Nom du commerce"]').clear().type("LIDL Grenoble Centre");
    cy.contains("button", "Enregistrer").click();

    cy.wait("@updateMerchantProfile")
      .its("request.body")
      .should("include", {
        name: "LIDL Grenoble Centre",
      });
    cy.contains("Vos informations ont été mises à jour.").should("be.visible");
  });

  it("crée une boutique merchant depuis l'interface front", () => {
    cy.mockMerchantSession().then((merchant) => {
      cy.stubMerchantDashboardData();
      stubCreateStore(merchant.merchantId);

      cy.visit("/merchant/dashboard/shops");
      cy.contains("button", "Créer une boutique").click();
      cy.contains(".swal2-title", "Créer une boutique").should("be.visible");

      cy.get("#swal-store-name").type("Amazon Lyon Part-Dieu");
      cy.get("#swal-store-address").type("17 rue Docteur Bouchut, Lyon");
      cy.get('input[name="swal-store-provider"][value="SHOPIFY"]').check();
      cy.get("#swal-store-domain").type("amazon-lyon.example.com");
      cy.get("#swal-store-description").type("Point de retrait Amazon à Lyon.");
      cy.contains(".swal2-actions button", "Créer").click();

      cy.wait("@createStore")
        .its("request.body")
        .should("deep.equal", {
          name: "Amazon Lyon Part-Dieu",
          address: "17 rue Docteur Bouchut, Lyon",
          description: "Point de retrait Amazon à Lyon.",
          domain: "amazon-lyon.example.com",
          provider: "SHOPIFY",
        });
      cy.contains(".swal2-title", "Boutique créée").should("be.visible");
    });
  });

  it("crée une commande merchant depuis l'interface front", () => {
    cy.mockMerchantSession().then((merchant) => {
      const storeId = merchant.stores[0].id;

      cy.stubMerchantDashboardData();
      stubCreateOrder(merchant.merchantId, storeId);

      cy.visit("/merchant/dashboard/orders");
      cy.contains("button", "Ajouter une commande").click();
      cy.contains(".swal2-title", "Créer une commande").should("be.visible");

      cy.get("#swal-order-store-id").select(storeId);
      cy.get("#swal-order-customer-name").type("Sophie Durand");
      cy.get("#swal-order-customer-phone-country").select("+33");
      cy.get("#swal-order-customer-phone").type("6 23 45 67 89");
      cy.get("#swal-order-reference").type("LIDL-GRENOBLE-1042");
      cy.get("#swal-order-type").select("GROCERY");
      cy.get("#swal-order-package-size").select("MEDIUM");
      cy.get("#swal-order-weight").type("4.5");
      cy.get("#swal-order-dropoff-address").type("8 avenue Alsace-Lorraine, Grenoble");
      cy.contains(".swal2-actions button", "Créer").click();

      cy.wait("@createOrder")
        .its("request.body")
        .should("deep.equal", {
          customerName: "Sophie Durand",
          customerPhone: "+33623456789",
          dropOffAddress: "8 avenue Alsace-Lorraine, Grenoble",
          orderReference: "LIDL-GRENOBLE-1042",
          type: "GROCERY",
          packageSize: "MEDIUM",
          weight: 4.5,
        });
      cy.contains(".swal2-title", "Commande créée").should("be.visible");
      cy.contains("7.40 EUR").should("be.visible");
    });
  });

  it("crée une API key merchant depuis l'interface front", () => {
    cy.mockMerchantSession().then((merchant) => {
      const storeId = merchant.stores[0].id;

      cy.stubMerchantDashboardData();
      stubCreateApiKey(merchant.merchantId);

      cy.visit("/merchant/dashboard/api-keys");
      cy.contains("button", "Créer une API key").click();
      cy.contains(".swal2-title", "Créer une API key").should("be.visible");

      cy.get("#swal-api-key-name").type("Amazon production");
      cy.get("#swal-api-key-store-id").select(storeId);
      cy.get("#swal-api-key-expires-at").type("2027-05-17T10:30");
      cy.contains(".swal2-actions button", "Créer").click();

      cy.wait("@createApiKey")
        .its("request.body")
        .should((body) => {
          expect(body).to.include({
            name: "Amazon production",
            storeId,
          });
          expect(body.expiresAt).to.match(/^2027-05-17T\d{2}:30:00\.000Z$/);
        });
      cy.contains(".swal2-title", "API key créée").should("be.visible");
      cy.contains("gm_live_amazon_production_7f4b9c").should("be.visible");
    });
  });
});
