// Demo signup behavior. Replace FORM_ENDPOINT with Formspree, Basin,
    // your own API route, or another email-capture endpoint before launch.
    const FORM_ENDPOINT = "";
    const form = document.querySelector("#signup-form");
    const email = document.querySelector("#email");
    const message = document.querySelector("#form-message");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      message.textContent = "";

      if (!email.validity.valid) {
        message.textContent = "Enter a valid email address.";
        email.focus();
        return;
      }

      const submitButton = form.querySelector("button");
      submitButton.disabled = true;
      submitButton.textContent = "Adding…";

      try {
        if (FORM_ENDPOINT) {
          const response = await fetch(FORM_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.value.trim() })
          });
          if (!response.ok) throw new Error("Signup failed");
        } else {
          localStorage.setItem("dab-launch-email", email.value.trim());
        }

        form.reset();
        message.textContent = "You're on the list. See you at the first drop.";
      } catch (error) {
        message.textContent = "Something went wrong. Please try again.";
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Notify me <span class="arrow">↗</span>';
      }
    });
