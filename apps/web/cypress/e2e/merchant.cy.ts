describe("Espace merchant", () => {
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
});
