describe("Inscription livreur", () => {
  const avatarFile = {
    contents: Cypress.Buffer.from("avatar"),
    fileName: "avatar-nadia.png",
    mimeType: "image/png",
  };

  const identityFile = {
    contents: Cypress.Buffer.from("document"),
    fileName: "carte-identite-nadia.pdf",
    mimeType: "application/pdf",
  };

  function stubRegistrationUploads() {
    cy.intercept("POST", "/api/uploads/presign", (request) => {
      const filename = String(request.body.filename);
      const encodedFilename = encodeURIComponent(filename);

      request.reply({
        statusCode: 200,
        body: {
          uploadUrl: `/api/uploads/mock/${encodedFilename}`,
          fileUrl: `https://cdn.gomile.test/${encodedFilename}`,
          viewUrl: `https://cdn.gomile.test/${encodedFilename}`,
        },
      });
    }).as("presignUpload");

    cy.intercept("PUT", "/api/uploads/mock/*", {
      statusCode: 200,
      body: "",
    }).as("signedUpload");
  }

  it("valide l'inscription livreur et envoie le bon payload", () => {
    cy.mockGuestSession();
    stubRegistrationUploads();
    cy.intercept("POST", "/api/auth/register/driver", {
      statusCode: 200,
      body: {
        user: {
          id: "driver-nadia-moreau",
          email: "nadia.moreau@example.com",
          role: "DRIVER",
        },
      },
    }).as("registerDriver");
    cy.intercept("POST", "/api/auth/logout", {
      statusCode: 200,
      body: { message: "Déconnecté." },
    }).as("logoutAfterDriverRegister");

    cy.visit("/driver/register");
    cy.contains("h1", "Inscription livreur").should("be.visible");
    cy.contains("button", "Étape suivante").click();
    cy.contains("Renseignez votre prénom.").should("be.visible");
    cy.contains("Ajoutez un avatar.").should("be.visible");

    cy.get("#driver-first-name").type("Nadia");
    cy.get("#driver-last-name").type("Moreau");
    cy.get("#driver-email").type("nadia.moreau@example.com");
    cy.get("#driver-phone").clear().type("+33612345678");
    cy.get("#driver-avatar-file").selectFile(avatarFile, { force: true });
    cy.get("#driver-password").type("Password123!");
    cy.contains("button", "Étape suivante").click();

    cy.get("#driver-birth-date").type("1992-04-18");
    cy.get("#driver-gender").select("FEMALE");
    cy.get("#driver-city").type("Grenoble");
    cy.get("#driver-zip-code").type("38000");
    cy.get("#driver-street").type("12 rue Lesdiguières");
    cy.contains("button", "Étape suivante").click();

    cy.get("#driver-delivery-city").type("Grenoble");
    cy.get("#driver-delivery-radius").type("8");
    cy.get("#driver-transport-type").select("BIKE");
    cy.contains("button", "Étape suivante").click();

    cy.get("#driver-document-selector").select("cniFile");
    cy.get("#driver-cniFile").selectFile(identityFile, { force: true });
    cy.get("#driver-siret").type("55210055400013");
    cy.contains("button", "Créer mon compte").click();

    cy.wait("@presignUpload")
      .its("request.body")
      .should("include", {
        filename: "avatar-nadia.png",
        contentType: "image/png",
      });
    cy.wait("@signedUpload");
    cy.wait("@presignUpload")
      .its("request.body")
      .should("include", {
        filename: "carte-identite-nadia.pdf",
        contentType: "application/pdf",
      });
    cy.wait("@signedUpload");

    cy.wait("@registerDriver")
      .its("request.body")
      .should("deep.equal", {
        firstName: "Nadia",
        lastName: "Moreau",
        email: "nadia.moreau@example.com",
        phone: "+33612345678",
        password: "Password123!",
        dateOfBirth: "1992-04-18",
        gender: "FEMALE",
        city: "Grenoble",
        zipCode: "38000",
        street: "12 rue Lesdiguières",
        deliveryCity: "Grenoble",
        deliveryRadius: 8,
        transportType: "BIKE",
        avatarUrl: "https://cdn.gomile.test/avatar-nadia.png",
        cniFile: "https://cdn.gomile.test/carte-identite-nadia.pdf",
        siret: "55210055400013",
      });

    cy.contains("Valide ton compte mail").should("be.visible");
    cy.wait("@logoutAfterDriverRegister");
  });
});
